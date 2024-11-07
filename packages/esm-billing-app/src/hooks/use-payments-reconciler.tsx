import { useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { processBillPayment, useBill, usePaymentModes } from '../billing.resource';
import { BillingConfig } from '../config-schema';
import { RequestStatus } from '../types';
import { createMobileMoneyPaymentPayload } from './useRequestStatus';

const fetchPaymentStatus = async ({
  url,
  billUUID,
}: {
  url: string;
  billUUID: string;
}): Promise<Array<{ requestStatus: RequestStatus; referenceNumber: string | null; amount: string }>> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      billId: billUUID,
    }),
  });

  if (res.ok) {
    const response = await res.json();
    return response;
  }

  if (!res.ok) {
    throw new Error('An error occurred checking payment state');
  }
};

export const usePaymentsReconciler = (billUUID: string) => {
  const { mpesaAPIBaseUrl } = useConfig<BillingConfig>();
  const { bill } = useBill(billUUID);
  const { paymentModes } = usePaymentModes();
  const url = `${mpesaAPIBaseUrl}/api/mpesa/check-payment-state-by-bill-id`;

  const mobileMoneyPaymentMethodInstanceTypeUUID = paymentModes.find((method) => method.name === 'Mobile Money')?.uuid;
  const paymentReferenceUUID = paymentModes
    .find((mode) => mode.name === 'Mobile Money')
    ?.attributeTypes.find((type) => type.description === 'Reference Number').uuid;

  const { data: billPayments } = useSWR(url + bill.uuid, () => fetchPaymentStatus({ url: url, billUUID: bill.uuid }));
  const aggregatorReferenceNumbers = billPayments?.map((pd) => pd.referenceNumber) ?? [];
  const billReferenceNumbers =
    bill.payments
      ?.filter((payment) => payment.instanceType.uuid === mobileMoneyPaymentMethodInstanceTypeUUID)
      .map((payment) => payment.attributes)
      .flat()
      .map((attr) => attr.value) ?? [];

  const referenceNumbersNotIncludedInBill = aggregatorReferenceNumbers.filter(
    (ref) => !billReferenceNumbers.includes(ref),
  );

  if (referenceNumbersNotIncludedInBill.length > 0) {
    for (let i = 0; i < referenceNumbersNotIncludedInBill.length; i++) {
      const ref = referenceNumbersNotIncludedInBill[i];
      const paymentInstance = billPayments?.find((pd) => pd.referenceNumber === ref);
      const amount = parseInt(paymentInstance?.amount);
      const requestStatus = paymentInstance?.requestStatus;

      if (requestStatus === 'COMPLETE') {
        const payload = createMobileMoneyPaymentPayload(bill, amount, mobileMoneyPaymentMethodInstanceTypeUUID, {
          uuid: paymentReferenceUUID,
          value: ref,
        });
        processBillPayment(payload, bill.uuid);
      }
    }
  }
};
