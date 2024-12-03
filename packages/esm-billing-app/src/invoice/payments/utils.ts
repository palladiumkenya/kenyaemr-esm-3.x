import { PaymentStatus } from '../../types';

/**
 * Checks if a specific billable item exists within a collection of billable items
 * @param {Array<Object>} billableItems - Collection of billable items to search through
 * @param {Object} targetItem - The billable item to search for
 * @param {string} targetItem.uuid - Unique identifier of the target item
 * @returns {boolean} - True if the target item exists in the collection, false otherwise
 * @throws {Error} - If billableItems is not an array or is empty/single item
 */
export const isBillableItemInCollection = (billableItems, targetItem) => {
  if (!Array.isArray(billableItems) || billableItems.length <= 1) {
    return false;
  }
  return billableItems.some((existingItem) => existingItem.uuid === targetItem.uuid);
};

/**
 * Extracts the service identifier from a billable item
 * @param {Object} billableItem - Item containing service information
 * @param {string} [billableItem.item] - Primary service identifier
 * @param {string} [billableItem.billableService] - Alternative service identifier
 * @returns {string|null} - The extracted service identifier or null if not found
 */
export const extractServiceIdentifier = (billableItem) => {
  const serviceIdentifier = billableItem.item || billableItem.billableService;
  return serviceIdentifier ? serviceIdentifier.split(':')[0] : null;
};

/**
 * Formats a Kenyan phone number to include country code (254)
 * @param {string|number} rawPhoneNumber - The unformatted phone number
 * @returns {string} - Properly formatted phone number with country code or error message
 * @example
 * formatKenyanPhoneNumber('0712345678') // Returns '254712345678'
 * formatKenyanPhoneNumber('712345678') // Returns '254712345678'
 */
export const formatKenyanPhoneNumber = (rawPhoneNumber) => {
  const digitsOnly = rawPhoneNumber.toString().replace(/\D/g, '');

  switch (true) {
    case digitsOnly.length === 12 && digitsOnly.startsWith('254'):
      return digitsOnly;
    case digitsOnly.length === 9 && digitsOnly.startsWith('7'):
      return `254${digitsOnly}`;
    case digitsOnly.length === 10 && digitsOnly.startsWith('0'):
      return `254${digitsOnly.substring(1)}`;
    default:
      return `Invalid Phone Number ${rawPhoneNumber}`;
  }
};

/**
 * Determines the payment status for a billable item based on payment conditions
 * @param {number} totalBillableItems - Total number of items in the bill
 * @param {Object} billableItem - The item being evaluated
 * @param {number} billableItem.price - Price per unit of the item
 * @param {number} billableItem.quantity - Quantity of items
 * @param {number} totalPaidAmount - Total amount paid towards the bill
 * @param {string} fallbackPaymentStatus - Default payment status if conditions aren't met
 * @returns {string} - The determined PaymentStatus (PAID or PENDING)
 */
export const determineBillableItemPaymentStatus = (
  totalBillableItems,
  billableItem,
  totalPaidAmount,
  fallbackPaymentStatus,
) => {
  if (totalBillableItems <= 1) {
    return fallbackPaymentStatus;
  }

  const itemTotalCost = billableItem.price * billableItem.quantity;
  return totalPaidAmount >= itemTotalCost ? PaymentStatus.PAID : PaymentStatus.PENDING;
};

/**
 * Checks if a billable item is fully paid based on the total amount paid
 * @param {number} totalPaidAmount - Total amount paid towards the bill
 * @param {Object} billableItem - The item to evaluate
 * @param {number} billableItem.price - Price of the item
 * @returns {string} - PaymentStatus.PAID or PaymentStatus.PENDING
 */
export const isBillableItemFullyPaid = (totalPaidAmount: number, billableItem: { price: number }) => {
  return totalPaidAmount >= billableItem.price ? PaymentStatus.PAID : PaymentStatus.PENDING;
};

/**
 * Generates a complete payment transaction payload from bill and payment details
 * @param {Object} billDetails - The complete bill information
 * @param {Object} billDetails.cashier - Cashier who processed the bill
 * @param {string} billDetails.cashier.uuid - Cashier's unique identifier
 * @param {number} billDetails.totalAmount - Total bill amount
 * @param {Array} [billDetails.payments=[]] - Previous payments made
 * @param {Array} [billDetails.lineItems=[]] - Items in the bill
 * @param {string} patientUuid - Patient's unique identifier
 * @param {Array} paymentFormValues - Payment information from form submission
 * @param {number} remainingBalance - Amount still to be paid
 * @param {Array} selectedBillableItems - Items selected for payment
 * @param {Object} timesheetDetails - Timesheet information
 * @param {Object} timesheetDetails.cashPoint - Cash point information
 * @param {string} timesheetDetails.cashPoint.uuid - Cash point's unique identifier
 * @returns {Object} - Complete payment transaction payload
 */
export const createPaymentPayload = (
  billDetails,
  patientUuid,
  paymentFormValues,
  remainingBalance,
  selectedBillableItems,
  timesheetDetails,
) => {
  const { totalAmount, payments = [], lineItems = [] } = billDetails;
  const initialPaymentStatus = remainingBalance <= 0 ? PaymentStatus.PAID : PaymentStatus.PENDING;

  // Transform existing payments
  const existingPayments = payments.map((payment) => ({
    amount: payment.amount,
    amountTendered: payment.amountTendered,
    attributes: [],
    instanceType: payment.instanceType.uuid,
  }));

  // Transform new payments
  const currentPayments = paymentFormValues.map((formValue) => ({
    amount: parseFloat(totalAmount.toFixed(2)),
    amountTendered: parseFloat(Number(formValue.amount).toFixed(2)),
    attributes: [],
    instanceType: formValue.method,
  }));

  // Combine and calculate payments
  const consolidatedPayments = [...currentPayments, ...existingPayments];
  const totalPaidAmount = consolidatedPayments.reduce((sum, payment) => sum + payment.amountTendered, 0);

  // Process billable items
  const processedLineItems = lineItems.map((lineItem) => ({
    ...lineItem,
    billableService: extractServiceIdentifier(lineItem),
    item: extractServiceIdentifier(lineItem),
    paymentStatus: isBillableItemInCollection(selectedBillableItems, lineItem)
      ? determineBillableItemPaymentStatus(lineItems.length, lineItem, totalPaidAmount, initialPaymentStatus)
      : isBillableItemFullyPaid(totalPaidAmount, lineItem),
  }));

  // Determine final bill status
  const hasUnpaidItems = processedLineItems.some((item) => item.paymentStatus === PaymentStatus.PENDING);
  const overallBillStatus = hasUnpaidItems ? PaymentStatus.PENDING : PaymentStatus.PAID;

  return {
    cashPoint: timesheetDetails?.cashPoint?.uuid,
    cashier: timesheetDetails?.cashier?.uuid,
    lineItems: processedLineItems,
    payments: consolidatedPayments,
    patient: patientUuid,
    status: selectedBillableItems?.length > 0 ? overallBillStatus : initialPaymentStatus,
  };
};
