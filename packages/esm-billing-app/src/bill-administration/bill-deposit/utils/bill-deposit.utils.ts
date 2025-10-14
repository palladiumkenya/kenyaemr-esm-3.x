import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type BillDeposit, type CreateDepositPayload } from '../types/bill-deposit.types';
import { MAX_REFERENCE_NUMBER_COUNTER } from '../constants/bill-deposit.constants';
import { formatCurrencySimple } from '../../../helpers/currency';

/**
 * Generates a unique reference number for bill deposits
 * Format: [Location Initials][YYMMDD][HHMMSS][Counter]
 * Example: RDK240315143022001 for "Railways Dispensary (Kisumu)"
 */
let counter = 0;

export const generateReferenceNumber = (locationDisplay: string): string => {
  // Extract location initials including parenthetical part
  // e.g., "Railways Dispensary (Kisumu)" -> "RDK"
  const locationInitials = locationDisplay
    .replace(/[()]/g, '')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  // Get current date and time in format YYMMDDHHMMSS
  const now = new Date();
  const dateTime = now.toISOString().slice(2, 19).replace(/[-:]/g, '');

  // Generate unique code using counter
  counter = (counter + 1) % MAX_REFERENCE_NUMBER_COUNTER;
  const uniqueCode = counter.toString().padStart(3, '0');

  return `${locationInitials}${dateTime}${uniqueCode}`;
};

/**
 * Saves a new bill deposit
 */
export const saveDeposit = async (deposit: CreateDepositPayload | Partial<BillDeposit>, uuid?: string) => {
  const url = `${restBaseUrl}/cashier/deposit` + (uuid ? `/${uuid}` : '');
  return await openmrsFetch(url, {
    method: 'POST',
    body: deposit,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Deletes a bill deposit
 */
export const deleteDeposit = async (uuid: string) => {
  const url = `${restBaseUrl}/cashier/deposit/${uuid}`;
  return await openmrsFetch(url, {
    method: 'DELETE',
  });
};

/**
 * Formats a deposit amount with currency symbol based on locale
 */
export const formatDepositAmount = (amount: number): string => {
  return formatCurrencySimple(amount);
};

/**
 * Validates a deposit amount
 */
export const validateDepositAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 100000000; // Assuming max deposit is 100M
};

/**
 * Add a bill deposit transaction
 */
export const addDepositTransaction = async (depositUuid: string, transaction: Record<string, string | number>) => {
  const url = `${restBaseUrl}/cashier/deposit/${depositUuid}/transaction`;
  return await openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(transaction),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Reverses a bill deposit transaction
 */
export const reverseTransaction = async (depositUuid: string, transactionUuid: string) => {
  const url = `${restBaseUrl}/cashier/deposit/${depositUuid}/transaction/${transactionUuid}`;
  return await openmrsFetch(url, { method: 'DELETE' });
};
