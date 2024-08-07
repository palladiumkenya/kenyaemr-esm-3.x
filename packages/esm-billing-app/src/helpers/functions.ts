import dayjs from 'dayjs';
import { Payment, LineItem } from '../types';

// amount already paid
export function calculateTotalAmountTendered(payments: Array<Payment>) {
  return Array.isArray(payments)
    ? payments.reduce((totalAmount, item) => {
        // Ensure that "amount" property is present and numeric
        if (typeof item.amount === 'number' && item.voided !== true) {
          return totalAmount + item.amount;
        }
        return totalAmount;
      }, 0)
    : 0;
}

// balance
export function calculateTotalBalance(lineItems: Array<LineItem>, payments: Array<Payment>) {
  return Math.min(this.calculateTotalAmount(lineItems) - this.calculateTotalAmountTendered(payments));
}

// total bill
export function calculateTotalAmount(lineItems: Array<LineItem>) {
  return Array.isArray(lineItems)
    ? lineItems.reduce((totalAmount, item) => {
        // Ensure that "price" and "quantity" properties are present and numeric
        if (typeof item.price === 'number' && typeof item.quantity === 'number' && item.voided !== true) {
          return totalAmount + item.price * item.quantity;
        }
        return totalAmount;
      }, 0)
    : 0;
}

export const convertToCurrency = (amountToConvert: number) => {
  const formatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  });

  let formattedAmount = formatter.format(Math.abs(amountToConvert));

  if (amountToConvert < 0) {
    formattedAmount = `- ${formattedAmount}`;
  }

  return formattedAmount;
};

export const getGender = (gender: string, t) => {
  switch (gender) {
    case 'male':
      return t('male', 'Male');
    case 'female':
      return t('female', 'Female');
    case 'other':
      return t('other', 'Other');
    case 'unknown':
      return t('unknown', 'Unknown');
    default:
      return gender;
  }
};

/**
 * Extracts and returns the substring after the first colon (:) in the input string.
 * The input string is expected to be in the format "uuid:string".
 *
 * @param {string} input - The input string from which the substring is to be extracted.
 * @returns {string} The substring found after the first colon in the input string.
 */
export function extractString(input: string): string {
  const parts = input.split(':');
  return removeUUID(parts.length < 2 ? input : parts[1]);
}

function removeUUID(str) {
  // Regular expression to match a UUID
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

  // Replace the UUID with an empty string
  return str.replace(uuidPattern, '');
}

// cleans the provider display name
export function extractNameString(formattedString) {
  if (!formattedString) {
    return '';
  }
  const parts = formattedString.split(' - ');
  return parts.length > 1 ? parts[1] : '';
}

export function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD');
}
