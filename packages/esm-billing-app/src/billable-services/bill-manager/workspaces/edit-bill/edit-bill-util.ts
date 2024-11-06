/**
 * Creates a payload for editing a bill by updating a specific line item
 * @param {LineItem} lineItem - The line item to be updated
 * @param {Object} data - New data for the line item
 * @param {string|number} data.quantity - New quantity
 * @param {string|number} data.price - New price
 * @param {string} adjustmentReason - The adjustment reason
 * @param {Bill} bill - The original bill
 * @returns {Object} The formatted payload for bill update
 */
export const createEditBillPayload = (lineItem, data, bill, adjustmentReason: string) => {
  if (!lineItem?.uuid || !bill?.lineItems) {
    throw new Error('Invalid input: lineItem and bill are required with valid properties');
  }

  // Helper function to safely parse integers with fallback
  const safeParseInt = (value, fallback) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Update line item with new quantity and price
  const updatedLineItem = {
    ...lineItem,
    quantity: safeParseInt(data?.quantity, lineItem.quantity),
    price: safeParseInt(data?.price, lineItem.price),
  };

  // Extract only necessary line item properties for the payload
  const formatLineItem = ({ item, quantity, price, priceName, priceUuid, lineItemOrder, uuid, paymentStatus }) => ({
    item,
    quantity,
    price,
    priceName,
    priceUuid,
    lineItemOrder,
    uuid,
    paymentStatus,
  });

  // Create the bill update payload
  return {
    cashPoint: bill.cashPointUuid,
    cashier: bill.cashier.uuid,
    lineItems: bill.lineItems.map((li) => formatLineItem(li.uuid === lineItem.uuid ? updatedLineItem : li)),
    payments: bill.payments,
    patient: bill.patientUuid,
    status: bill.status,
    billAdjusted: bill.uuid,
    adjustmentReason,
  };
};
