import { FormPayment, LineItem, MappedBill } from '../../types';

export const hasLineItem = (lineItems: Array<LineItem>, item: LineItem) => {
  if (lineItems?.length === 0) {
    return false;
  }
  const foundItem = lineItems.find((lineItem) => lineItem.uuid === item.uuid);
  return Boolean(foundItem);
};

export const createPaymentPayload = (
  bill: MappedBill,
  patientUuid: string,
  formValues: Array<FormPayment>,
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

export const processBillItem = (item: LineItem) => (item.item || item.billableService)?.split(':')[0];

export function formatPhoneNumber(phone) {
  let phone_ = phone.toString().replace(/\D/g, ''); // Convert to string first
  const length = phone_.length;

  let _phone = '';
  if (length === 12 && phone_.substring(0, 3) === '254') {
    _phone = phone_;
  } else if (length === 9 && phone_.substring(0, 1) === '7') {
    _phone = '254' + phone_;
  } else if (length === 10 && phone_.substring(0, 1) === '0') {
    _phone = '254' + phone_.substring(1, 10);
  } else {
    _phone = 'Invalid Phone Number ' + phone;
  }

  return _phone;
}
