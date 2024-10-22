import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  autopsyEncounterUuid: {
    _type: Type.String,
    _description: 'Encounter UUID for autopsy',
    _default: '',
  },
  formsList: {
    _type: Type.Object,
    _description: 'List of form UUIDs',
    _default: {
      autopsyFormUuid: '',
    },
  },
  morgueVisitTypeUuid: {
    _type: Type.String,
    _description: ' UUID for morgue visit',
    _default: '2098caab-dd9b-499e-9e2d-89130488d109',
  },
  morgueDepartmentServiceTypeUuid: {
    _type: Type.String,
    _description: ' UUID for morgue department service type',
    _default: '61a12cde-f3b7-4b73-a0ba-94d22cdc642b',
  },
};

export interface BillingConfig {
  visitAttributeTypes: {
    isPatientExempted: string;
    paymentMethods: string;
    insuranceScheme: string;
    policyNumber: string;
    exemptionCategory: string;
    billPaymentStatus: string;
  };
  inPatientVisitTypeUuid: string;
  patientExemptionCategories: Array<{ value: string; label: string }>;
  excludedPaymentMode: Array<{ uuid: string; label: string }>;
  enforceBillPayment: boolean;
  billingStatusQueryUrl: string;
  mpesaAPIBaseUrl: string;
  insuranceSchemes: Array<string>;
  nationalPatientUniqueIdentifierTypeUuid: string;
  cashPointUuid: string;
  cashierUuid: string;
  patientBillsUrl: string;
}

export type ConfigObject = {
  formsList: {
    autopsyFormUuid: string;
  };
  autopsyEncounterUuid: string;
  morgueVisitTypeUuid: string;
  morgueDepartmentServiceTypeUuid: string;
};
