import { MappedBill } from '../../types';
import { Payment } from './payments.component';

export const createPaymentPayload = (
  bill: MappedBill,
  patientUuid: string,
  formValues: Array<Payment>,
  amountDue: number,
) => {
  const { cashier } = bill;
  const totalAmount = bill?.totalAmount;
  const paymentStatus = amountDue <= 0 ? 'PAID' : 'PENDING';

  const billPayment = formValues.map((formValue) => ({
    amount: parseFloat(totalAmount.toFixed(2)),
    amountTendered: parseFloat(Number(formValue.amount).toFixed(2)),
    attributes: [],
    instanceType: formValue.method,
  }));
  const processedPayment = {
    cashPoint: bill.cashPointUuid,
    cashier: cashier.uuid,
    payments: [...billPayment],
    patient: patientUuid,
    status: paymentStatus,
  };

  return processedPayment;
};
