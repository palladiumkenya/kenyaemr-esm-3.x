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
  const previousPayments = bill.payments.map((payment) => ({
    amount: payment.amount,
    amountTendered: payment.amountTendered,
    attributes: [],
    instanceType: payment.instanceType.uuid,
  }));
  const billPayment = formValues
    .map((formValue) => ({
      amount: parseFloat(totalAmount.toFixed(2)),
      amountTendered: parseFloat(Number(formValue.amount).toFixed(2)),
      attributes: [],
      instanceType: formValue.method,
    }))
    .concat(previousPayments);

  const processedPayment = {
    cashPoint: bill.cashPointUuid,
    cashier: cashier.uuid,
    lineItems: bill.lineItems.map((lineItem) => ({
      ...lineItem,
      billableService: processBillItem(lineItem),
      item: processBillItem(lineItem),
      paymentStatus: 'PAID',
    })),
    payments: [...billPayment],
    patient: patientUuid,
    status: paymentStatus,
  };

  return processedPayment;
};

const processBillItem = (item) => (item.item || item.billableService)?.split(':')[0];
