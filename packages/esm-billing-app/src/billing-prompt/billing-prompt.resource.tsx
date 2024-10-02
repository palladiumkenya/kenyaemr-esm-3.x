import { Visit, useConfig, useVisit } from '@openmrs/esm-framework';
import { BillingConfig } from '../config-schema';
import { usePatientBills } from '../modal/require-payment.resource';

const INPATIENT_VISIT_TYPE = 'a73e2ac6-263b-47fc-99fc-e0f2c09fc914';
const INSURANCE_PAYMENT_METHOD = 'beac329b-f1dc-4a33-9e7c-d95821a137a6';

// helper functions
const isCurrentVisitInPatient = (currentVisit: Visit) => currentVisit?.visitType?.uuid === INPATIENT_VISIT_TYPE;
const isPaymentMethodInsurance = (currentVisit: Visit, insurancePaymentMethod: string) =>
  currentVisit?.attributes.find((attr) => attr.attributeType.uuid === insurancePaymentMethod)?.value ===
  INSURANCE_PAYMENT_METHOD;

export const useBillingPrompt = (patientUuid: string) => {
  const {
    visitAttributeTypes: { paymentMethods },
  } = useConfig<BillingConfig>();
  const { currentVisit, isLoading: isLoadingVisit } = useVisit(patientUuid);
  const { patientBills: bills, isLoading, error } = usePatientBills(patientUuid);

  const flattenBills = bills
    .flatMap((bill) => bill.lineItems)
    .filter((lineItem) => lineItem.paymentStatus !== 'EXEMPTED');
  const flattenPayments = bills.flatMap((bill) => bill.payments);

  const totalBill = flattenBills.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const totalPayments = flattenPayments.reduce((acc, curr) => acc + curr.amountTendered, 0);
  const patientBillBalance = totalBill - totalPayments;

  // Should show billing prompt if the following conditions are met:
  // 1. The current visit is not an inpatient visit
  // 2. The patient has a bill balance
  // 3. The payment method is not insurances

  return {
    shouldShowBillingPrompt:
      !isCurrentVisitInPatient(currentVisit) &&
      patientBillBalance > 0 &&
      !isPaymentMethodInsurance(currentVisit, paymentMethods),
    isLoading: isLoading || isLoadingVisit,
    error,
    currentVisit,
    bills,
  };
};
