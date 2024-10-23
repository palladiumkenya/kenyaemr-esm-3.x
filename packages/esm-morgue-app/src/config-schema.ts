import { Type } from '@openmrs/esm-framework';
import { visitAttributeTags } from '../../esm-billing-app/src/index';

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
    _default: 'c9abc980-7580-4247-9164-1a87ef25febb',
  },
  insurancepaymentModeUuid: {
    _type: Type.String,
    _description: ' UUID for insurance payment mode',
    _default: 'beac329b-f1dc-4a33-9e7c-d95821a137a6',
  },
  morgueCompartmentTagUuid: {
    _type: Type.String,
    _description: 'UUID for morgue compartment tag',
    _default: '8ff46770-6ac7-478f-85ba-439a53546bf0',
  },
  tagNumberConceptUuid: {
    _type: Type.String,
    _description: 'UUID for tag number concept',
    _default: '9a953c7b-7aa2-481c-8aac-b8bc9be742ee',
  },
  morgueAdmissionEncounterType: {
    _type: Type.String,
    _description: 'Encounter type for morgue admission',
    _default: 'a0c999e3-4a2d-4caf-8142-19c0bb092c60',
  },
  visitPaymentMethodAttributeUuid: {
    _type: Type.String,
    _description: 'UUID for visit payment method attribute',
    _default: 'e6cb0c3b-04b0-4117-9bc6-ce24adbda802',
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
  insurancepaymentModeUuid: string;
  morgueCompartmentTagUuid: string;
  tagNumberConceptUuid: string;
  morgueAdmissionEncounterType: string;
  visitPaymentMethodAttributeUuid: string;
};
