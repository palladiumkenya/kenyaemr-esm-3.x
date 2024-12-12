import { Filter, MappedBill } from '../../../types';

const createPaymentMethodFilter =
  (paymentMethods: Array<string>) =>
  (bill: MappedBill): MappedBill => {
    // If no payment methods specified, return original bill
    if (!paymentMethods || paymentMethods.length === 0) {
      return bill;
    }

    // Create a new bill object with filtered payments
    return {
      ...bill,
      payments: bill.payments.filter((payment) =>
        paymentMethods.some((method) => payment.instanceType.name.toLowerCase() === method.toLowerCase()),
      ),
    };
  };

const createServiceTypesFilter =
  (serviceUuids: Array<string>) =>
  (bill: MappedBill): boolean => {
    if (!serviceUuids || serviceUuids.length === 0) {
      return true;
    }
    return bill.lineItems.some((item) => serviceUuids.includes(item.serviceTypeUuid));
  };

// Main filtering function
export const filterBills = (bills: Array<MappedBill>, filters: Filter): Array<MappedBill> => {
  const { paymentMethods = [], serviceTypes = [], cashiers = [], status } = filters;
  const billsWithFilteredPayments = bills.map(createPaymentMethodFilter(paymentMethods));

  const otherFilters = [
    createServiceTypesFilter(serviceTypes),
    (bill: MappedBill) => !cashiers.length || cashiers.includes(bill.cashier.uuid),
    (bill: MappedBill) => !status || bill.status === status,
    (bill: MappedBill) => bill.payments.length > 0,
  ];

  return billsWithFilteredPayments.filter((bill) => otherFilters.every((filterFn) => filterFn(bill)));
};
