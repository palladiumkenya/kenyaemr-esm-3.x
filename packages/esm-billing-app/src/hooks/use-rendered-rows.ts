import flatMapDeep from 'lodash-es/flatMapDeep';
import { useParams } from 'react-router-dom';
import { useBillsServiceTypes } from '../billable-services/payment-history/use-bills-service-types';
import { usePaymentModes } from '../billing.resource';
import { MappedBill } from '../types';

const getAllValues = (obj: Object): Array<any> => {
  return flatMapDeep(obj, (value) => {
    if (typeof value === 'object' && value !== null) {
      return getAllValues(value);
    }
    return value;
  });
};

export const useRenderedRows = (bills: MappedBill[], filters: Array<string>) => {
  const { billsServiceTypes } = useBillsServiceTypes(bills);
  const { paymentModes } = usePaymentModes(false);
  const { paymentPointUUID } = useParams();
  const isOnPaymentPointPage = Boolean(paymentPointUUID);

  const cashiers = Array.from(new Map(bills.map((bill) => [bill.cashier.uuid, bill.cashier])).values());

  const cashierFilters = cashiers.filter((c) => filters.includes(c.display)).map((c) => c.display);
  const serviceTypeFilters = billsServiceTypes.filter((st) => filters.includes(st.uuid)).map((st) => st.uuid);
  const paymentModeFilters = paymentModes?.filter((pm) => filters.includes(pm.name)).map((pm) => pm.name);

  if (bills.length === 0 || !bills) {
    return [];
  }

  if (filters.length === 0) {
    return bills.filter((b) => {
      return isOnPaymentPointPage ? b.cashPointUuid === paymentPointUUID : true;
    });
  }

  const filteredBills = bills
    .filter((b) => {
      return isOnPaymentPointPage ? b.cashPointUuid === paymentPointUUID : true;
    })
    .filter((row) => {
      if (cashierFilters.length === 0) {
        return true;
      }
      const rowValues = getAllValues(row);
      return cashierFilters.some((cashier) =>
        rowValues.some((value) => String(value).toLowerCase().includes(cashier.toLowerCase())),
      );
    })
    .filter((row) => {
      if (paymentModeFilters.length === 0) {
        return true;
      }
      const rowValues = getAllValues(row);
      return paymentModeFilters.some((paymentType) =>
        rowValues.some((value) => String(value).toLowerCase().includes(paymentType.toLowerCase())),
      );
    })
    .filter((row) => {
      if (serviceTypeFilters.length === 0) {
        return true;
      }
      const rowValues = getAllValues(row);
      return serviceTypeFilters.some((serviceType) =>
        rowValues.some((value) => String(value).toLowerCase().includes(serviceType.toLowerCase())),
      );
    });

  return filteredBills;
};
