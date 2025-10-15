import { useMemo } from 'react';
import { usePaymentModes } from '../../billing.resource';
import { MappedBill, Payment } from '../../types';
import { usePaymentFilterContext } from './usePaymentFilterContext';

export const usePaymentModeGroupTotals = (bills: MappedBill[] = []) => {
  const { appliedFilters } = usePaymentFilterContext();
  const { paymentModes } = usePaymentModes(false);

  const paymentModeFilters = paymentModes?.filter((pm) => appliedFilters.includes(pm.name)).map((pm) => pm.name);

  return useMemo(() => {
    if (!paymentModes?.length) {
      return [];
    }

    if (!bills.length) {
      return paymentModes.map((mode) => ({
        type: mode.name,
        total: 0,
      }));
    }

    const filteredRows = paymentModeFilters.length
      ? bills.filter((row) => paymentModeFilters?.includes(row.payments[0].instanceType.name))
      : bills;

    // Process all payments in a single reduce operation
    const paymentTotals = filteredRows.reduce<Record<string, number>>((totals, bill) => {
      bill.payments.forEach((payment: Payment) => {
        const paymentType = payment.instanceType.name;
        totals[paymentType] = (totals[paymentType] || 0) + payment.amountTendered;
      });
      return totals;
    }, {});

    return Object.entries(paymentTotals).map(([type, total]) => ({
      type,
      total,
    }));
  }, [paymentModes, bills, paymentModeFilters]);
};
