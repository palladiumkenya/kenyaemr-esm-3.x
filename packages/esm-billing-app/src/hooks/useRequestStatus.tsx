import { useState, useEffect, SetStateAction } from 'react';
import { getRequestStatus, readableStatusMap, getErrorMessage } from '../m-pesa/mpesa-resource';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../config-schema';
import { LineItem, MappedBill, PaymentStatus, RequestStatus } from '../types';
import { extractErrorMessagesFromResponse, waitForASecond } from '../utils';
import { processBillPayment, usePaymentModes } from '../billing.resource';
import { mutate } from 'swr';
import { processBillItem } from '../invoice/payments/utils';

const createMobileMoneyPaymentPayload = (bill: MappedBill, amount: number, mobileMoneyInstanceTypeUUID: string) => {
  const { cashier } = bill;
  const totalAmount = bill?.totalAmount;
  const amountDue = Number(bill.totalAmount) - (Number(bill.tenderedAmount) + amount);
  const paymentStatus = amountDue <= 0 ? PaymentStatus.PAID : PaymentStatus.PENDING;

  const previousPayments = bill.payments.map((payment) => ({
    amount: payment.amount,
    amountTendered: payment.amountTendered,
    attributes: [],
    instanceType: payment.instanceType.uuid,
  }));

  const newPayment = {
    amount: parseFloat(totalAmount.toFixed(2)),
    amountTendered: parseFloat(amount.toFixed(2)),
    attributes: [],
    instanceType: mobileMoneyInstanceTypeUUID,
  };

  const updatedPayments = [...previousPayments, newPayment];

  const updatedLineItems: LineItem[] = [];

  let remainder = amount;

  for (let i = 0; i < bill.lineItems.length; i++) {
    const lineItem = bill.lineItems[i];
    const totalLineItemAmount = lineItem.price * lineItem.quantity;
    const newLineItem: LineItem = {
      ...lineItem,
      billableService: processBillItem(lineItem),
      item: processBillItem(lineItem),
    };

    if (remainder >= totalLineItemAmount) {
      remainder -= totalLineItemAmount;
      updatedLineItems.push({ ...newLineItem, paymentStatus: PaymentStatus.PAID });
    } else {
      updatedLineItems.push(newLineItem);
    }
  }

  const newBillPaymentStatus = updatedLineItems.some((item) => item.paymentStatus === PaymentStatus.PENDING)
    ? PaymentStatus.PENDING
    : PaymentStatus.PAID;

  const processedPayment = {
    cashPoint: bill.cashPointUuid,
    cashier: cashier.uuid,
    lineItems: updatedLineItems,
    payments: updatedPayments,
    patient: bill.patientUuid,
    status: updatedLineItems.length > 0 ? newBillPaymentStatus : paymentStatus,
  };

  return processedPayment;
};

type RequestData = {
  requestId: string;
  requestStatus: RequestStatus | null;
  amount: string | null;
};

/**
 * useRequestStatus
 * @param setNotification a function to call with the appropriate notification type
 * @returns a function to trigger the polling.
 */
export const useRequestStatus = (
  setNotification: React.Dispatch<SetStateAction<{ type: 'error' | 'success'; message: string } | null>>,
  closeModal: () => void,
  bill: MappedBill,
): [RequestData, React.Dispatch<React.SetStateAction<RequestData | null>>] => {
  const { t } = useTranslation();
  const { mpesaAPIBaseUrl } = useConfig<BillingConfig>();
  const { paymentModes } = usePaymentModes();

  const [requestData, setRequestData] = useState<RequestData>({
    requestId: null,
    requestStatus: null,
    amount: null,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (requestData.requestId && !['COMPLETE', 'FAILED', 'NOT-FOUND'].includes(requestData.requestStatus)) {
      const fetchStatus = async () => {
        try {
          const status = await getRequestStatus(requestData.requestId, mpesaAPIBaseUrl);
          if (status === 'COMPLETE') {
            clearInterval(interval);

            waitForASecond().then(() => {
              closeModal();
            });

            const mobileMoneyPaymentMethodInstanceTypeUUID = paymentModes.find(
              (method) => method.name === 'Mobile Money',
            ).uuid;

            const mobileMoneyPayload = createMobileMoneyPaymentPayload(
              bill,
              parseInt(requestData.amount),
              mobileMoneyPaymentMethodInstanceTypeUUID,
            );

            console.log('mobileMoneyPayload', mobileMoneyPayload);

            processBillPayment(mobileMoneyPayload, bill.uuid).then(
              () => {
                showSnackbar({
                  title: t('billPayment', 'Bill payment'),
                  subtitle: 'Bill payment processing has been successful',
                  kind: 'success',
                  timeoutInMs: 3000,
                });
                const url = `/ws/rest/v1/cashier/bill/${bill.uuid}`;
                mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
              },
              (error) => {
                showSnackbar({
                  title: t('failedBillPayment', 'Bill payment failed'),
                  subtitle: `An unexpected error occurred while processing your bill payment. Please contact the system administrator and provide them with the following error details: ${extractErrorMessagesFromResponse(
                    error.responseBody,
                  )}`,
                  kind: 'error',
                  timeoutInMs: 3000,
                  isLowContrast: true,
                });
              },
            );
          }

          if (status === 'FAILED' || status === 'NOT-FOUND') {
            clearInterval(interval);
          }

          if (status === 'COMPLETE' || status === 'INITIATED') {
            setNotification({ type: 'success', message: readableStatusMap.get(status) });
          }

          if (status === 'FAILED' || status === 'NOT-FOUND') {
            setNotification({ type: 'error', message: readableStatusMap.get(status) });
          }
        } catch (error) {
          clearInterval(interval);
          setNotification({ type: 'error', message: getErrorMessage(error, t) });
        }
      };

      interval = setInterval(fetchStatus, 2000);

      return () => clearInterval(interval);
    }
  }, [
    bill,
    closeModal,
    mpesaAPIBaseUrl,
    paymentModes,
    requestData.amount,
    requestData.requestId,
    requestData.requestStatus,
    setNotification,
    t,
  ]);

  return [requestData, setRequestData];
};
