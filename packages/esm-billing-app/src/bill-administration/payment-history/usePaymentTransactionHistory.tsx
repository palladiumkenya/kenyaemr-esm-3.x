import dayjs from 'dayjs';
import { useBills } from '../../billing.resource';
import { PaymentStatus, Filter } from '../../types';
import { filterBills } from './filters/bill-filter';
import { usePaymentFilterContext } from './usePaymentFilterContext';

function extractServiceName(billableService: string): string {
  const parts = billableService.split(':');
  if (parts.length === 1) {
    return billableService.trim();
  }
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return parts[0].trim().match(uuidPattern) ? parts[1].trim() : parts[0].trim();
}

export const usePaymentTransactionHistory = (filters: Filter) => {
  const { dateRange } = usePaymentFilterContext();
  const { bills, isLoading, isValidating, error } = useBills(
    '',
    PaymentStatus.PAID,
    dayjs(dateRange[0]).toDate(),
    dayjs(dateRange[1]).toDate(),
  );

  const filteredBills = filterBills(bills ?? [], filters).map((bill) => ({
    ...bill,
    lineItems: bill.lineItems.map((item) => ({
      ...item,
      billableService: extractServiceName(item.billableService),
    })),
  }));

  return { bills: filteredBills, isLoading, isValidating, error };
};
