import { Button, InlineNotification } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate, showSnackbar } from '@openmrs/esm-framework';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { processBillPayment } from '../../billing.resource';
import { convertToCurrency } from '../../helpers';
import { useClockInStatus } from '../../payment-points/use-clock-in-status';
import { LineItem, PaymentFormValue, PaymentStatus, type MappedBill } from '../../types';
import { computeTotalPrice, computeWaivedAmount, extractErrorMessagesFromResponse } from '../../utils';
import { InvoiceBreakDown } from './invoice-breakdown/invoice-breakdown.component';
import PaymentForm from './payment-form/payment-form.component';
import PaymentHistory from './payment-history/payment-history.component';
import styles from './payments.scss';
import { createPaymentPayload } from './utils';

type PaymentProps = {
  bill: MappedBill;
  selectedLineItems: Array<LineItem>;
};

const Payments: React.FC<PaymentProps> = ({ bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const paymentSchema = z.object({
    method: z.string().refine((value) => !!value, 'Payment method is required'),
    amount: z.number().refine((value) => {
      const amountDue = Number(bill.totalAmount) - (Number(bill.tenderedAmount) + Number(value));
      return amountDue >= 0;
    }, 'Amount paid should not be greater than amount due'),
    referenceCode: z.union([z.number(), z.string()]).optional(),
  });
  const { globalActiveSheet } = useClockInStatus();

  const methods = useForm<PaymentFormValue>({
    mode: 'all',
    defaultValues: { payment: [] },
    resolver: zodResolver(z.object({ payment: z.array(paymentSchema) })),
  });
  const formArrayMethods = useFieldArray({ name: 'payment', control: methods.control });

  const formValues = useWatch({
    name: 'payment',
    control: methods.control,
  });
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  const totalWaivedAmount = computeWaivedAmount(bill);
  const totalAmountTendered = formValues?.reduce((curr: number, prev) => curr + Number(prev.amount), 0) ?? 0;
  const amountDue = Number(bill.totalAmount) - (Number(bill.tenderedAmount) + Number(totalAmountTendered));

  // selected line items amount due
  const selectedLineItemsAmountDue =
    selectedLineItems
      .filter((item) => item.paymentStatus !== PaymentStatus.PAID)
      .reduce((curr: number, prev) => curr + Number(prev.price), 0) - totalWaivedAmount;

  const handleNavigateToBillingDashboard = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + 'home/billing',
    });

  const handleProcessPayment = () => {
    const { remove } = formArrayMethods;
    const paymentPayload = createPaymentPayload(
      bill,
      bill.patientUuid,
      formValues,
      amountDue,
      selectedLineItems,
      globalActiveSheet,
    );
    remove();

    processBillPayment(paymentPayload, bill.uuid).then(
      (resp) => {
        showSnackbar({
          title: t('billPayment', 'Bill payment'),
          subtitle: 'Bill payment processing has been successful',
          kind: 'success',
          timeoutInMs: 3000,
        });
        const url = `/ws/rest/v1/cashier/bill/${bill.uuid}`;
        mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
        setPaymentSuccessful(true);
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
  };

  const amountDueDisplay = (amount: number) => (amount < 0 ? 'Client balance' : 'Amount Due');

  const isFullyPaid = totalAmountTendered >= selectedLineItemsAmountDue;
  const hasAmountPaidExceeded =
    formValues.some((item) => item.amount !== 0) &&
    totalAmountTendered > selectedLineItemsAmountDue &&
    bill.lineItems.length > 1;
  const isPaymentInvalid = !isFullyPaid && formValues.some((item) => item.amount !== 0) && bill.lineItems.length > 1;

  return (
    <FormProvider {...methods}>
      <div className={styles.wrapper}>
        <div className={styles.paymentContainer}>
          <CardHeader title={t('payments', 'Payments')}>
            <span></span>
          </CardHeader>
          <div>
            {bill && <PaymentHistory bill={bill} />}
            {isPaymentInvalid && (
              <InlineNotification
                title={t('incompletePayment', 'Incomplete payment')}
                subtitle={t(
                  'paymentErrorSubtitle',
                  'Please ensure all selected line items are fully paid, Total amount expected is {{selectedLineItemsAmountDue}}',
                  {
                    selectedLineItemsAmountDue: convertToCurrency(selectedLineItemsAmountDue),
                  },
                )}
                lowContrast
                kind="error"
                className={styles.paymentError}
              />
            )}
            {hasAmountPaidExceeded && (
              <InlineNotification
                title={t('paymentError', 'Payment error')}
                subtitle={t(
                  'paymentErrorSubtitle',
                  'Amount paid {{totalAmountTendered}} should not be greater than amount due {{selectedLineItemsAmountDue}} for selected line items',
                  {
                    totalAmountTendered: convertToCurrency(totalAmountTendered),
                    selectedLineItemsAmountDue: convertToCurrency(selectedLineItemsAmountDue),
                  },
                )}
                lowContrast
                kind="warning"
                className={styles.paymentError}
              />
            )}
            <PaymentForm {...formArrayMethods} disablePayment={amountDue <= 0} amountDue={amountDue} />
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.paymentTotals}>
          <InvoiceBreakDown label={t('totalAmount', 'Total Amount')} value={convertToCurrency(bill.totalAmount)} />
          <InvoiceBreakDown
            label={t('totalTendered', 'Total Tendered')}
            value={convertToCurrency(bill.tenderedAmount + totalAmountTendered)}
          />
          <InvoiceBreakDown label={t('discount', 'Discount')} value={'--'} />
          <InvoiceBreakDown
            hasBalance={amountDue < 0}
            label={amountDueDisplay(amountDue)}
            value={convertToCurrency(amountDue)}
          />
          <div className={styles.processPayments}>
            <Button onClick={handleNavigateToBillingDashboard} kind="secondary">
              {t('discard', 'Discard')}
            </Button>
            <Button
              onClick={() => handleProcessPayment()}
              disabled={!formValues?.length || !methods.formState.isValid || hasAmountPaidExceeded}>
              {t('processPayment', 'Process Payment')}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default Payments;
