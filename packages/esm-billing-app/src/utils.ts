import { OpenmrsResource } from '@openmrs/esm-framework';
import { LineItem, MappedBill } from './types';

export const createBillWaiverPayload = (
  bill: MappedBill,
  amountWaived: number,
  totalAmount: number,
  lineItems: Array<LineItem>,
  paymentModes: Array<OpenmrsResource>,
) => {
  const { cashier } = bill;

  const billPayment = {
    amount: parseFloat(totalAmount.toFixed(2)),
    amountTendered: parseFloat(Number(amountWaived).toFixed(2)),
    attributes: [],
    instanceType: paymentModes?.find((mode) => mode.name.toLowerCase().includes('waiver'))?.uuid,
  };

  const processedLineItems = lineItems.map((lineItem) => ({
    ...lineItem,
    billableService: processBillItem(lineItem),
    item: processBillItem(lineItem),
    paymentStatus: 'PAID',
  }));

  const processedPayment = {
    cashPoint: bill.cashPointUuid,
    cashier: cashier.uuid,
    lineItems: processedLineItems,
    payments: [...bill.payments, billPayment],
    patient: bill.patientUuid,
  };

  return processedPayment;
};

const processBillItem = (item) => (item.item || item.billableService)?.split(':')[0];

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

  items?.forEach((item) => {
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
