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
    _default: '6307dbe2-f336-4c11-a393-50c2769f455a',
  },
  morgueDepartmentServiceTypeUuid: {
    _type: Type.String,
    _description: ' UUID for morgue department service type',
    _default: '4a4a5b10-5740-48ff-929d-9f29c77125e9',
  },
  insurancepaymentModeUuid: {
    _type: Type.String,
    _description: ' UUID for insurance payment mode',
    _default: 'beac329b-f1dc-4a33-9e7c-d95821a137a6',
  },
  morgueCompartmentTagUuid: {
    _type: Type.String,
    _description: 'UUID for morgue compartment tag',
    _default: '53a3a11b-c731-48bb-b8e0-efaf3207a34c',
  },
  tagNumberUuid: {
    _type: Type.String,
    _description: 'UUID for tag number concept',
    _default: '4e4456fc-314a-4729-aa24-62e2b0637544',
  },
  morgueAdmissionEncounterType: {
    _type: Type.String,
    _description: 'Encounter type for morgue admission',
    _default: '3d2df845-6f3c-45e7-b91a-d828a1f9c2e8',
  },
  visitPaymentMethodAttributeUuid: {
    _type: Type.String,
    _description: 'UUID for visit payment method attribute',
    _default: 'e6cb0c3b-04b0-4117-9bc6-ce24adbda802',
  },
  obNumberUuid: {
    _type: Type.String,
    _description: 'UUID for ob number concept',
    _default: '188ffac9-af2f-4a83-be58-f914f8bae08a',
  },
  policeNameUuid: {
    _type: Type.String,
    _description: 'UUID for police name concept',
    _default: '8c9922b3-37a8-4473-b81b-221a82c1c3cf',
  },
  burialPermitNumberUuid: {
    _type: Type.String,
    _description: 'UUID for burial permit number concept',
    _default: '63f961a7-1614-45ce-8cd1-7d5e98aa23c4',
  },
  policeIDNumber: {
    _type: Type.String,
    _description: 'UUID for police id number concept',
    _default: '8a960c91-fc0e-4143-a9db-6c9fa57b51e2',
  },
  encounterProviderRoleUuid: {
    _type: Type.UUID,
    _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
    _description: "The provider role to use for the registration encounter. Default is 'Unkown'.",
  },
  dischargeAreaUuid: {
    _type: Type.String,
    _description: 'UUID for discharge area concept',
    _default: 'a458fd00-199e-4d08-ad5c-1be322a6ccbe',
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
  tagNumberUuid: string;
  morgueAdmissionEncounterType: string;
  visitPaymentMethodAttributeUuid: string;
  policeStatementUuid: string;
  obNumberUuid: string;
  encounterProviderRoleUuid: string;
  policeNameUuid: string;
  burialPermitNumberUuid: string;
  policeIDNumber: string;
  dischargeAreaUuid: string;
};
