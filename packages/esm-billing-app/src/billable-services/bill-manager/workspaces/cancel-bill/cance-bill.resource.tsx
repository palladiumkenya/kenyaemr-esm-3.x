import { LineItem, PaymentStatus } from '../../../../types';

export const createCancelBillPayload = (bill, lineItem, reason) => {
  // Void the line item to prevent it from being included in the bill
  const updatedLineItems = bill.lineItems.map((currentLineItem) =>
    currentLineItem.uuid === lineItem.uuid
      ? { ...currentLineItem, voided: true, voidReason: reason, paymentStatus: PaymentStatus.CANCELLED }
      : currentLineItem,
  );

  const formatLineItem = (props: LineItem) => ({
    item: props.item,
    quantity: props.quantity,
    price: props.price,
    priceName: props.priceName,
    priceUuid: props.priceUuid,
    lineItemOrder: props.lineItemOrder,
    uuid: props.uuid,
    paymentStatus: props.paymentStatus,
    voided: props.voided,
    voidReason: props.voidReason,
  });

  const hasOneLineItem = bill.lineItems.length === 1;

  const adjustBillPayload = {
    cashPoint: bill.cashPointUuid,
    cashier: bill.cashier.uuid,
    lineItems: updatedLineItems.map((li) => formatLineItem(li)),
    payments: bill.payments,
    patient: bill.patientUuid,
    status: hasOneLineItem ? PaymentStatus.CANCELLED : PaymentStatus.ADJUSTED,
    billAdjusted: bill.uuid,
    adjustmentReason: reason,
    ...(hasOneLineItem && { voided: true }),
  };

  return adjustBillPayload;
};
