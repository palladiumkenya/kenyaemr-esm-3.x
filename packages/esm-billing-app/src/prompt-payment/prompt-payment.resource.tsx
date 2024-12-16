import { Visit, openmrsFetch, restBaseUrl, useConfig, useVisit } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { mapBillProperties } from '../billing.resource';
import { BillingConfig } from '../config-schema';
import { BillingPromptType, MappedBill, PatientInvoice } from '../types';
import dayjs from 'dayjs';

interface BillingPromptResult {
  shouldShowBillingPrompt: boolean;
  isLoading: boolean;
  error: Error | null;
  currentVisit: Visit | null;
  bills: Array<MappedBill>;
  billingDuration?: {
    isWithinPromptDuration: boolean;
    hoursSinceLastBill: number;
    lastDateBilled: Date;
    mostRecentBill: MappedBill;
  };
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
 * 4. For patient-chart, prompt is not shown if the line items in the bill are only orders and the billing duration is within the prompt duration
 *
 * @param patientUuid - The UUID of the patient to check billing status for
 * @returns {BillingPromptResult} An object containing:
 *  - shouldShowBillingPrompt: boolean indicating if the billing prompt should be displayed
 *  - isLoading: boolean indicating if visit or billing data is still loading
 *  - error: any error that occurred during data fetching
 *  - currentVisit: the current visit object or null
 *  - bills: array of the patient's bills
 *  - billingDuration: an object containing billing duration information
 */
export const useBillingPrompt = (
  patientUuid: string,
  promptType: BillingPromptType = 'billing-orders',
): BillingPromptResult => {
  const config = useConfig<BillingConfig>();
  const { currentVisit, isLoading: isLoadingVisit } = useVisit(patientUuid);
  const { patientBills: bills, isLoading: isLoadingBills, error } = usePatientBills(patientUuid);

  const { paymentMethodsUuidsThatShouldNotShowPrompt, inPatientVisitTypeUuid } = config;

  const hasLoaded = isLoadingBills && isLoadingVisit;
  const isExcludedPaymentMethod = checkPaymentMethodExclusion(currentVisit, paymentMethodsUuidsThatShouldNotShowPrompt);
  const patientBillBalance = calculateBillBalance(bills);
  const hasOnlyOrders = hasOnlyOrderBills(bills);
  const billingDuration = checkBillingDuration(bills, config);

  if (promptType === 'patient-chart' && hasOnlyOrders) {
    return {
      shouldShowBillingPrompt: false,
      isLoading: hasLoaded,
      error,
      currentVisit,
      bills,
      billingDuration,
    };
  }

  if (promptType === 'patient-chart' && config.promptDuration.enable && !billingDuration.isWithinPromptDuration) {
    return {
      shouldShowBillingPrompt: false,
      isLoading: hasLoaded,
      error,
      currentVisit,
      bills,
      billingDuration,
    };
  }

  return {
    shouldShowBillingPrompt:
      !isExcludedPaymentMethod && shouldShowPrompt(currentVisit, patientBillBalance, inPatientVisitTypeUuid),
    isLoading: hasLoaded,
    error,
    currentVisit,
    bills,
    billingDuration,
  };
};

/**
 * Custom hook to fetch patient bills.
 *
 * @param {string} patientUuid - The UUID of the patient.
 * @returns {Object} The response object containing patient bills and hook states.
 * @returns {Array<PatientInvoice>} [returns.patientBills] - An array of patient invoices.
 * @returns {boolean} [returns.isLoading] - Whether the data is currently being loaded.
 * @returns {Error|null} [returns.error] - Any error that occurred during the fetch, or null if none.
 * @returns {boolean} [returns.isValidating] - Whether the data is being revalidated.
 * @returns {Function} [returns.mutate] - A function to manually trigger a re-fetch of the data.
 */
export const usePatientBills = (patientUuid: string) => {
  const { patientBillsUrl } = useConfig<BillingConfig>();
  const url = patientBillsUrl.replace('${restBaseUrl}', restBaseUrl);
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    // a null key in useSWR essentially disables the fetch call until a patientUUID is available
    patientUuid ? `${url}&patientUuid=${patientUuid}&includeVoided=true` : null,
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

/**
 * Checks if bills are within the configured prompt duration and provides billing timing information
 *
 * @param {Array<MappedBill>} bills - Array of patient bills containing dateCreated timestamps
 * @param {Object} config - Configuration object containing prompt duration settings
 * @param {number} config.promptDuration - Maximum number of hours to show prompt after bill creation
 *
 * @returns {Object} Billing duration information
 * @returns {boolean} returns.isWithinPromptDuration - Whether the most recent bill is within prompt duration
 * @returns {number} returns.hoursSinceLastBill - Hours elapsed since most recent bill
 * @returns {string} returns.lastDateBilled - ISO timestamp of most recent bill
 * @returns {MappedBill} returns.mostRecentBill - The most recent bill object
 *
 * @throws {Error} When bills array is empty or promptDuration is not configured
 *
 * @example
 * const bills = [{ dateCreated: '2023-01-01T10:00:00Z' }];
 * const config = { promptDuration: 24 };
 * const result = checkBillingDuration(bills, config);
 * // Returns: {
 * //   isWithinPromptDuration: true,
 * //   hoursSinceLastBill: 5,
 * //   lastDateBilled: '2023-01-01T10:00:00Z',
 * //   mostRecentBill: { dateCreated: '2023-01-01T10:00:00Z' }
 * // }
 */
const checkBillingDuration = (bills: Array<MappedBill> = [], config: BillingConfig) => {
  if (!config?.promptDuration?.enable) {
    return {
      isWithinPromptDuration: false,
      hoursSinceLastBill: 0,
      lastDateBilled: new Date(),
      mostRecentBill: null,
    };
  }

  const sortedBills = [...bills].sort((a, b) => dayjs(b.dateCreated).diff(dayjs(a.dateCreated)));

  const mostRecentBill = sortedBills[0];
  const lastDateBilled = new Date(mostRecentBill?.dateCreatedUnformatted);
  const currentDate = new Date();

  // Calculate hours since last bill
  const hoursSinceLastBill = dayjs(currentDate).diff(dayjs(lastDateBilled), 'hour');

  return {
    isWithinPromptDuration: hoursSinceLastBill <= config.promptDuration.duration,
    hoursSinceLastBill,
    lastDateBilled,
    mostRecentBill,
  };
};
