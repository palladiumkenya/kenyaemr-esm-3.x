export const createEditBillPayload = (lineItem, data, bill) => {
  const updatedLineItem = { ...lineItem, quantity: parseInt(data?.quantity) };

  const updatedBill = {
    ...bill,
    lineItems: bill.lineItems.map((li) => (li.uuid === lineItem.uuid ? updatedLineItem : li)),
  };

  const billUpdatePayload = {
    cashPoint: bill.cashPointUuid,
    cashier: bill.cashier.uuid,
    lineItems: updatedBill.lineItems.map((li) => ({
      item: li.item,
      quantity: li.quantity,
      price: li.price,
      priceName: li.priceName,
      priceUuid: li.priceUuid,
      lineItemOrder: li.lineItemOrder,
      uuid: li.uuid,
      paymentStatus: li.paymentStatus,
    })),
    payments: bill.payments,
    patient: bill.patientUuid,
    status: bill.status,
    billAdjusted: bill.uuid,
  };

  return billUpdatePayload;
};
