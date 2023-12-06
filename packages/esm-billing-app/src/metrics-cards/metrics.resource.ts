import { calculateTotalAmount, convertToCurrency } from '../helpers';
import { MappedBill } from '../types';

/**
 * A custom hook for calculating bill metrics.
 *
 * This hook takes in an array of bills and calculates the total amount for different
 * bill statuses (cumulative, pending, paid) using provided helper functions.
 *
 * @param {Array<Object>} bills - An array of bill objects. Each bill object should have a `status` and `lineItems` properties.
 *
 * @returns {{
 *   cumulativeBills: string,
 *   pendingBills: string,
 *   paidBills: string
 * }}
 */

export const useBillMetrics = (bills: Array<MappedBill>) => {
  const calculateTotals = (status?: string) => {
    const filteredItems = status
      ? bills.filter((bill) => bill.status === status).flatMap((bill) => bill.lineItems)
      : bills.flatMap((bill) => bill.lineItems);
    return calculateTotalAmount(filteredItems);
  };

  const paidBills = bills
    .flatMap((bill) => bill.payments)
    .flatMap((payment) => payment.amountTendered)
    .reduce((prev, curr) => curr + prev, 0);

  const cumulativeBills = calculateTotals();
  const pendingBills = cumulativeBills - paidBills;

  return {
    cumulativeBills: convertToCurrency(cumulativeBills),
    pendingBills: convertToCurrency(pendingBills),
    paidBills: convertToCurrency(paidBills),
  };
};
