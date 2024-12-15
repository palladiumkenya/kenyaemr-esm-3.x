import flatMapDeep from 'lodash-es/flatMapDeep';
import { useLocation, useParams } from 'react-router-dom';
import { useBillsServiceTypes } from '../billable-services/payment-history/useBillServiceTypes';
import { usePaymentModes } from '../billing.resource';
import { MappedBill, Timesheet } from '../types';

const getAllValues = (obj: Object): Array<any> => {
  return flatMapDeep(obj, (value) => {
    if (typeof value === 'object' && value !== null) {
      return getAllValues(value);
    }
    return value;
  });
};

export const useRenderedRows = (bills: MappedBill[], filters: Array<string>, timesheet?: Timesheet) => {
  const { pathname } = useLocation();
  const { billsServiceTypes } = useBillsServiceTypes(bills);
  const { paymentModes } = usePaymentModes(false);
  const { paymentPointUUID } = useParams();
  const isOnPaymentPointPage = Boolean(paymentPointUUID);

  const cashiers = Array.from(new Map(bills.map((bill) => [bill.cashier.uuid, bill.cashier])).values());

  const cashierFilters = cashiers.filter((c) => filters.includes(c.display)).map((c) => c.display);
  const serviceTypeFilters = billsServiceTypes.filter((st) => filters.includes(st.uuid)).map((st) => st.uuid);
  const paymentModeFilters = paymentModes?.filter((pm) => filters.includes(pm.name)).map((pm) => pm.name);

  const preFiltered = bills
    .filter((b) => (isOnPaymentPointPage ? b.cashPointUuid === paymentPointUUID : true))
    .filter((bill) => {
      if (!timesheet) {
        return true;
      }

      if (timesheet.cashier.uuid !== bill.cashier.uuid) {
        return true;
      }

      const billPaymentTime = bill.payments.sort((a, b) => b.dateCreated - a.dateCreated).at(0).dateCreated;
      const billCreatedOnTime = new Date(bill.dateCreatedUnformatted);

      const isOnPaidBillsOnlyPage = pathname === '/payment-history';
      const pivot = isOnPaidBillsOnlyPage ? new Date(billPaymentTime) : billCreatedOnTime;

      const timesheetStartDate = new Date(timesheet.clockIn);
      const timesheetEndDate = timesheet.clockOut ? new Date(timesheet.clockOut) : new Date();
      return timesheetStartDate <= pivot && timesheetEndDate >= pivot;
    });

  if (bills.length === 0 || !bills) {
    return [];
  }

  if (filters.length === 0) {
    return preFiltered;
  }

  const filteredBills = preFiltered
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
      return paymentModeFilters.some((paymentType) => {
        return rowValues.some((value) => String(value).toLowerCase() === paymentType.toLowerCase());
      });
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
