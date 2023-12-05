/* eslint-disable prettier/prettier */
import { MappedBill } from '../../types';
import { Payment } from './payments.component';

export const processPayments = (bill: MappedBill, patientUuid: string, formValues: Array<Payment>) => {
  const { cashier, lineItems } = bill;
  const totalAmount = bill?.totalAmount;

  const billPayment = formValues.map((formValue) => ({
    amount: totalAmount,
    amountTendered: formValue.amount,
    attributes: [],
    instanceType: '5920ccd6-5ee7-432e-8335-fddf048611c8',
  }));
  const processedPayment = {
    cashPoint: bill.cashPointUuid,
    cashier: cashier.uuid,
    payments: [...bill.payments, ...billPayment],
    patient: patientUuid,
    status: 'PENDING',
  };

  return processedPayment;
};
