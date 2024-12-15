import dayjs from 'dayjs';
import { useBills } from '../../billing.resource';
import { PaymentStatus, Filter } from '../../types';
import { filterBills } from './filters/bill-filter';
import { usePaymentFilterContext } from './usePaymentFilterContext';

export const usePaymentTransactionHistory = (filters: Filter) => {
  const { dateRange } = usePaymentFilterContext();
  const { bills, isLoading, isValidating, error } = useBills(
    '',
    PaymentStatus.PAID,
    dayjs(dateRange[0]).toDate(),
    dayjs(dateRange[1]).toDate(),
  );

  const filteredBills = filterBills(bills ?? [], filters);

  return { bills: filteredBills, isLoading, isValidating, error };
};
