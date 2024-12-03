import { LineItem, MappedBill, Payment, PaymentMethod, PaymentStatus } from './types';

// Helper functions
const formatAmount = (amount: number): number => {
  return parseFloat(amount.toFixed(2));
};

const findWaiverPaymentMode = (paymentModes: PaymentMethod[]): PaymentMethod | undefined => {
  return paymentModes.find((mode) => mode.name.toLowerCase().includes('waiver'));
};

const createWaiverAttributes = (
  waiverPaymentMode: PaymentMethod | undefined,
  waiveReason: string,
): Array<{ attributeType: string; value: string }> => {
  if (!waiverPaymentMode?.uuid || !waiverPaymentMode.attributeTypes[0]) {
    return [];
  }

  return [
    {
      attributeType: waiverPaymentMode.attributeTypes[0].uuid,
      value: waiveReason,
    },
  ];
};

const createPaymentPayload = (
  payment: Payment,
): {
  amountTendered: number;
  amount: number;
  attributes: Array<{ attributeType: string | undefined; value: string }>;
  instanceType: string | undefined;
} => {
  return {
    amountTendered: formatAmount(payment.amountTendered),
    amount: formatAmount(payment.amount),
    attributes: payment.attributes.map((attribute) => ({
      attributeType: attribute.attributeType?.uuid,
      value: attribute.value,
    })),
    instanceType: payment?.instanceType?.uuid,
  };
};

/**
 * Creates a bill waiver payload for processing payments
 * @param bill - The mapped bill information
 * @param amountWaived - Amount to be waived
 * @param totalAmount - Total bill amount
 * @param lineItems - Array of line items in the bill
 * @param paymentModes - Available payment methods
 * @param waiveReason - Reason for waiving the amount
 * @returns Processed payment payload
 * @throws Error if required parameters are missing
 */
export const createBillWaiverPayload = (
  bill: MappedBill,
  amountWaived: number,
  totalAmount: number,
  lineItems: Array<LineItem>,
  paymentModes: Array<PaymentMethod>,
  waiveReason: string,
): {
  cashPoint: string;
  cashier: string;
  lineItems: Array<LineItem>;
  payments: Array<any>;
  patient: string;
} => {
  // Input validation
  if (!bill || !lineItems.length || !paymentModes.length) {
    throw new Error('Missing required parameters for bill waiver payload');
  }

  const waiverPaymentMode = findWaiverPaymentMode(paymentModes);
  const waiverAttributes = createWaiverAttributes(waiverPaymentMode, waiveReason);

  const billPayment = {
    amount: formatAmount(totalAmount),
    amountTendered: formatAmount(amountWaived),
    attributes: waiverAttributes,
    instanceType: waiverPaymentMode?.uuid,
  };

  const previousPaymentsPayload = bill.payments.map(createPaymentPayload);

  const processedLineItems = lineItems.map((lineItem) => ({
    ...lineItem,
    billableService: processBillItem(lineItem),
    item: processBillItem(lineItem),
    paymentStatus: totalAmount === amountWaived ? PaymentStatus.PAID : PaymentStatus.POSTED,
  }));

  return {
    cashPoint: bill.cashPointUuid,
    cashier: bill.cashier.uuid,
    lineItems: processedLineItems,
    payments: [...previousPaymentsPayload, billPayment],
    patient: bill.patientUuid,
  };
};

const processBillItem = (item) => (item?.item || item?.billableService)?.split(':')[0];

function extractMessage(input: string): string | null {
  const parts = input?.split('=>');
  if (parts?.length > 0) {
    return parts[parts.length - 1].trim();
  }
  return null;
}

/**
 * Extracts error messages from a given error response object.
 * If fieldErrors are present, it extracts the error messages from each field.
 * If globalErrors are present, it extracts the error messages from each global error.
 * Otherwise, it returns the top-level error message.
 *
 * @param {ErrorObject} errorObject - The error response object.
 */
export function extractErrorMessagesFromResponse(errorObject): string {
  const {
    error: { fieldErrors, globalErrors, message },
  } = errorObject ?? {};

  if (Object.keys(fieldErrors ?? {})?.length > 0) {
    return Object.values(fieldErrors)
      .flatMap((errors: Array<any>) => errors.map((error) => error.message))
      .join('\n');
  }

  if (globalErrors?.length) {
    return globalErrors.map((error) => error.message).join('\n');
  }

  return extractMessage(message) ?? 'An error occurred';
}

export const computeTotalPrice = (items) => {
  if (items && !items.length) {
    return 0;
  }

  let totalPrice = 0;

  items.forEach((item) => {
    const { price, quantity } = item;
    totalPrice += price * quantity;
  });

  return totalPrice;
};

export function waitForASecond(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Resolved after a seconds');
    }, 1000);
  });
}

export const computeWaivedAmount = (bill: MappedBill) => {
  return bill.payments
    .filter((payment) => payment.instanceType.name.toLowerCase() === 'waiver')
    .reduce((curr: number, prev) => curr + Number(prev.amountTendered), 0);
};
