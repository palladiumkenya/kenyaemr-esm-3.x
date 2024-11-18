import { Visit, openmrsFetch, restBaseUrl, useConfig, useVisit } from '@openmrs/esm-framework';
import { BillingConfig } from '../config-schema';
import { BillingPromptType, MappedBill, PatientInvoice, PaymentStatus } from '../types';
import useSWR from 'swr';
import { useMemo } from 'react';
import { mapBillProperties } from '../billing.resource';

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
 * @param inPatientVisitTypeUuid - UUID identifying inpatient visit type
 * @returns boolean indicating whether the billing prompt should be shown
 */
const shouldShowPrompt = (
  currentVisit: Visit | null,
  patientBillBalance: number,
  inPatientVisitTypeUuid: string,
): boolean => {
  const isInPatient = isCurrentVisitInPatient(currentVisit, inPatientVisitTypeUuid);
  return patientBillBalance > 0 && !isInPatient;
};
// Check if all line items are orders
const hasOnlyOrderBills = (bills: Array<MappedBill>): boolean => {
  const flattenedBills = bills.flatMap((bill) => bill.lineItems);
  // check if all line items are orders, line item with order has order not set to null
  return flattenedBills.every((item) => item.order);
};

/**
 * A custom hook that determines whether a billing prompt should be displayed for a patient
 * or processes medical orders for a patient, checking their visit type, bill balance, and payment method.
 *
 * The prompt will be shown if:
 * 1. The current visit is not an inpatient visit
 * 2. The patient has a positive bill balance
 * 3. The payment method is not in the excluded payment methods list
 * 4. For patient-chart, prompt is not shown if the line items in the bill are only orders
 *
 * @param patientUuid - The UUID of the patient to check billing status for
 * @returns {BillingPromptResult} An object containing:
 *  - shouldShowBillingPrompt: boolean indicating if the billing prompt should be displayed
 *  - isLoading: boolean indicating if visit or billing data is still loading
 *  - error: any error that occurred during data fetching
 *  - currentVisit: the current visit object or null
 *  - bills: array of the patient's bills
 */
export const useBillingPrompt = (
  patientUuid: string,
  promptType: BillingPromptType = 'billing-orders',
): BillingPromptResult => {
  const config = useConfig<BillingConfig>();
  const { currentVisit, isLoading: isLoadingVisit } = useVisit(patientUuid);
  const { patientBills: bills, isLoading: isLoadingBills, error } = usePatientBills(patientUuid);

  const { paymentMethodsUuidsThatShouldNotShowPrompt, inPatientVisitTypeUuid } = config;

  const isExcludedPaymentMethod = checkPaymentMethodExclusion(currentVisit, paymentMethodsUuidsThatShouldNotShowPrompt);

  const patientBillBalance = calculateBillBalance(bills);
  const hasOnlyOrders = hasOnlyOrderBills(bills);

  if (promptType === 'patient-chart' && hasOnlyOrders) {
    return {
      shouldShowBillingPrompt: false,
      isLoading: isLoadingBills || isLoadingVisit,
      error,
      currentVisit,
      bills,
    };
  }

  return {
    shouldShowBillingPrompt:
      !isExcludedPaymentMethod && shouldShowPrompt(currentVisit, patientBillBalance, inPatientVisitTypeUuid),
    isLoading: isLoadingBills || isLoadingVisit,
    error,
    currentVisit,
    bills,
  };
};

/*
 Custom hook to fetch patient bills
 @param patientUuid - The UUID of the patient
 @returns {
    patientBills: Array<PatientInvoice>,
    isLoading: boolean,
    error: Error,
    isValidating: boolean,
    mutate: () => void
 }
*/
export const usePatientBills = (patientUuid: string) => {
  const { patientBillsUrl } = useConfig<BillingConfig>();
  const url = patientBillsUrl.replace('${restBaseUrl}', restBaseUrl);
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    patientUuid ? `${url}&patientUuid=${patientUuid}&includeVoided=true` : url,
    openmrsFetch,
    {
      errorRetryCount: 2,
    },
  );

  const patientBills = useMemo(() => {
    return data?.data?.results?.map(mapBillProperties) ?? [];
  }, [data?.data?.results]);

  return {
    patientBills: patientBills ?? [],
    isLoading,
    error,
    isValidating,
    mutate,
  };
};
