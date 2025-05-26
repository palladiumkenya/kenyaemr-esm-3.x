export const BILL_DEPOSIT_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  USED: 'USED',
  REFUNDED: 'REFUNDED',
  VOIDED: 'VOIDED',
} as const;

export const BILL_DEPOSIT_TYPES = {
  CASH: 'CASH',
  INSURANCE: 'INSURANCE',
  MOBILE_MONEY: 'MOBILE_MONEY',
  WAIVER: 'WAIVER',
} as const;

export const CUSTOM_REPRESENTATION =
  'custom:(uuid,display,voided,patient:(uuid,display,person,identifiers:(uuid,display,identifier)),amount,depositType,status,referenceNumber,description,transactions:full,dateCreated,availableBalance)';

export const MAX_REFERENCE_NUMBER_COUNTER = 999;

export const BILL_DEPOSIT_TRANSACTION_TYPES = {
  APPLY: 'APPLY',
  REFUND: 'REFUND',
  TRANSFER: 'REVERSE',
};
