import { LineItem, MappedBill } from '../../types';
import { Payment } from './payments.component';

const hasLineItem = (lineItems: Array<LineItem>, item: LineItem) => {
  if (lineItems?.length === 0) {
    return false;
  }
  const foundItem = lineItems.find((lineItem) => lineItem.uuid === item.uuid);
  return Boolean(foundItem);
};

export const createPaymentPayload = (
  bill: MappedBill,
  patientUuid: string,
  formValues: Array<Payment>,
  amountDue: number,
  selectedLineItems: Array<LineItem>,
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

  const newPayments = formValues.map((formValue) => ({
    amount: parseFloat(totalAmount.toFixed(2)),
    amountTendered: parseFloat(Number(formValue.amount).toFixed(2)),
    attributes: [],
    instanceType: formValue.method,
  }));

  const updatedPayments = newPayments.concat(previousPayments);
  const totalAmountRendered = updatedPayments.reduce((acc, payment) => acc + payment.amountTendered, 0);

  const updatedLineItems = bill.lineItems.map((lineItem) => ({
    ...lineItem,
    billableService: processBillItem(lineItem),
    item: processBillItem(lineItem),
    paymentStatus:
      bill?.lineItems.length > 1
        ? hasLineItem(selectedLineItems ?? [], lineItem) && totalAmountRendered >= lineItem.price * lineItem.quantity
          ? 'PAID'
          : 'PENDING'
        : paymentStatus,
  }));

  const allItemsBillPaymentStatus =
    updatedLineItems.filter((item) => item.paymentStatus === 'PENDING').length === 0 ? 'PAID' : 'PENDING';

  const processedPayment = {
    cashPoint: bill.cashPointUuid,
    cashier: cashier.uuid,
    lineItems: updatedLineItems,
    payments: [...updatedPayments],
    patient: patientUuid,
    status: selectedLineItems?.length > 0 ? allItemsBillPaymentStatus : paymentStatus,
  };

  return processedPayment;
};

const processBillItem = (item) => (item.item || item.billableService)?.split(':')[0];
