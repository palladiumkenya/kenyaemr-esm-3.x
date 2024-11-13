import { Visit, useConfig, useVisit } from '@openmrs/esm-framework';
import { BillingConfig } from '../config-schema';
import { usePatientBills } from '../modal/require-payment.resource';
import { MappedBill } from '../types';

interface BillingPromptResult {
  shouldShowBillingPrompt: boolean;
  isLoading: boolean;
  error: Error | null;
  currentVisit: Visit | null;
  bills: Array<MappedBill>;
}

// Constants
const PAYMENT_METHOD_ATTRIBUTE_NAME = 'Payment Method' as const;

// Helper functions
const isCurrentVisitInPatient = (currentVisit: Visit | null, inPatientVisitTypeUuid: string): boolean => {
  if (!currentVisit?.visitType?.uuid) {
    return false;
  }
  return currentVisit.visitType.uuid === inPatientVisitTypeUuid;
};

const findVisitAttributeByType = (visit: Visit | null, predicate: (attr) => boolean): string | undefined => {
  return visit?.attributes?.find(predicate)?.value;
};

/**
 * Checks if the payment method associated with the current visit is in the list of excluded payment methods
 * @param currentVisit - The current visit object or null if no active visit
 * @param excludedPaymentMethods - Array of payment method UUIDs that should be excluded
 * @returns boolean indicating whether the visit's payment method is in the excluded list
 */
export const checkPaymentMethodExclusion = (currentVisit: Visit | null, excludedPaymentMethods: string[]): boolean => {
  const paymentMethod = findVisitAttributeByType(currentVisit, (attr) =>
    attr.attributeType.name.includes(PAYMENT_METHOD_ATTRIBUTE_NAME),
  );
  return excludedPaymentMethods.includes(paymentMethod ?? '');
};

const calculateBillBalance = (bills: Array<MappedBill>): number => {
  const flattenBills = bills.flatMap((bill) => bill.lineItems.filter((item) => item.paymentStatus !== 'EXEMPTED'));

  const totalBill = flattenBills.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const totalPayments = bills.flatMap((bill) => bill.payments).reduce((acc, curr) => acc + curr.amountTendered, 0);

  return totalBill - totalPayments;
};

/**
 * Determines whether a billing prompt should be shown based on visit and balance criteria
 * @param currentVisit - The current visit object or null if no active visit
 * @param patientBillBalance - The patient's current bill balance
 * @param paymentMethods - String containing payment method information
 * @param inPatientVisitTypeUuid - UUID identifying inpatient visit type
 * @returns boolean indicating whether the billing prompt should be shown
 */
const shouldShowPrompt = (
  currentVisit: Visit | null,
  patientBillBalance: number,
  paymentMethods: string,
  inPatientVisitTypeUuid: string,
): boolean => {
  const isInPatient = isCurrentVisitInPatient(currentVisit, inPatientVisitTypeUuid);
  return patientBillBalance > 0 && !isInPatient;
};

/**
 * A custom hook that determines whether a billing prompt should be displayed for a patient
 * based on their visit type, bill balance, and payment method.
 *
 * The prompt will be shown if:
 * 1. The current visit is not an inpatient visit
 * 2. The patient has a positive bill balance
 * 3. The payment method is not in the excluded payment methods list
 *
 * @param patientUuid - The UUID of the patient to check billing status for
 * @returns {BillingPromptResult} An object containing:
 *  - shouldShowBillingPrompt: boolean indicating if the billing prompt should be displayed
 *  - isLoading: boolean indicating if visit or billing data is still loading
 *  - error: any error that occurred during data fetching
 *  - currentVisit: the current visit object or null
 *  - bills: array of the patient's bills
 */
export const useBillingPrompt = (patientUuid: string): BillingPromptResult => {
  const config = useConfig<BillingConfig>();
  const { currentVisit, isLoading: isLoadingVisit } = useVisit(patientUuid);
  const { patientBills: bills, isLoading: isLoadingBills, error } = usePatientBills(patientUuid);

  const {
    visitAttributeTypes: { paymentMethods },
    paymentMethodsUuidsThatShouldNotShowPrompt,
    inPatientVisitTypeUuid,
  } = config;

  const isExcludedPaymentMethod = checkPaymentMethodExclusion(currentVisit, paymentMethodsUuidsThatShouldNotShowPrompt);

  const patientBillBalance = calculateBillBalance(bills);

  return {
    shouldShowBillingPrompt:
      !isExcludedPaymentMethod &&
      shouldShowPrompt(currentVisit, patientBillBalance, paymentMethods, inPatientVisitTypeUuid),
    isLoading: isLoadingBills || isLoadingVisit,
    error,
    currentVisit,
    bills,
  };
};
