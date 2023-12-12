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
    formattedAmount = `(${formattedAmount})`;
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
