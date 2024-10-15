import { usePaymentModes } from '../../billing.resource';
import { MappedBill } from '../../types';

export type PaymentTypeTotal = { type: string; total: number };

export const usePaymentTotals = (renderedRows: MappedBill[] | null) => {
  const { paymentModes } = usePaymentModes(false);

  if (!paymentModes) {
    return [];
  }

  if (!renderedRows) {
    return paymentModes.map((mode) => {
      return { total: 0, type: mode.name };
    });
  }

  const paymentTotals: PaymentTypeTotal[] = [];

  for (let i = 0; i < paymentModes.length; i++) {
    const paymentMode = paymentModes[i];
    const paymentModeTotal = renderedRows
      .filter((bill) => {
        const billPaymentModeUUIDs = new Set(bill.payments.map((p) => p.instanceType.uuid));
        return billPaymentModeUUIDs.has(paymentMode.uuid);
      })
      .reduce((acc, curr) => curr.totalAmount + acc, 0);

    paymentTotals.push({ total: paymentModeTotal, type: paymentMode.name });
  }

  return paymentTotals;
};
