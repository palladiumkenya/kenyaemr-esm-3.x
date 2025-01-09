import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  morgueVisitTypeUuid: {
    _type: Type.String,
    _description: ' UUID for morgue visit',
    _default: '02b67c47-6071-4091-953d-ad21452e830c',
    _default: '02b67c47-6071-4091-953d-ad21452e830c',
  },
  morgueDepartmentServiceTypeUuid: {
    _type: Type.String,
    _description: ' UUID for morgue department service type',
    _default: 'd7bd4cc0-90b1-4f22-90f2-ab7fde936727',
  },
  insurancepaymentModeUuid: {
    _type: Type.String,
    _description: ' UUID for insurance payment mode',
    _default: 'beac329b-f1dc-4a33-9e7c-d95821a137a6',
  },
  morgueCompartmentTagUuid: {
    _type: Type.String,
    _description: 'UUID for morgue compartment tag',
    _default: 'a69f6810-fa6a-4423-a3e4-f88e8ac032dd',
  },
  tagNumberUuid: {
    _type: Type.String,
    _description: 'UUID for tag number concept',
    _default: '13ba9c45-c540-4f10-b915-fa3d7baeb3d1',
  },
  morgueAdmissionEncounterType: {
    _type: Type.String,
    _description: 'Encounter type for morgue admission',
    _default: '3d2df845-6f3c-45e7-b91a-d828a1f9c2e8',
  },
  morgueDischargeEncounterTypeUuid: {
    type: Type.String,
    _description: 'Encounter type for morgue discharge',
    _default: '3d618f40b-b5a3-4f17-81c8-2f04e2aad58e',
  },
  visitPaymentMethodAttributeUuid: {
    _type: Type.String,
    _description: 'UUID for visit payment method attribute',
    _default: 'e6cb0c3b-04b0-4117-9bc6-ce24adbda802',
  },
  obNumberUuid: {
    _type: Type.String,
    _description: 'UUID for ob number concept',
    _default: 'c756d06a-22a5-4b66-933e-3d44667b72a0',
  },
  policeNameUuid: {
    _type: Type.String,
    _description: 'UUID for police name concept',
    _default: '6d58d9b5-6f84-4e77-941e-f5cc86d18a60',
  },
  burialPermitNumberUuid: {
    _type: Type.String,
    _description: 'UUID for burial permit number concept',
    _default: '29ef3df3-9845-49b0-96f2-5fb6d6240039',
  },
  policeIDNumber: {
    _type: Type.String,
    _description: 'UUID for police id number concept',
    _default: '8d488d02-d1d8-41a5-8219-61f4fc5dbeb0',
  },
  encounterProviderRoleUuid: {
    _type: Type.UUID,
    _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
    _description: "The provider role to use for the registration encounter. Default is 'Unkown'.",
  },
  dischargeAreaUuid: {
    _type: Type.String,
    _description: 'UUID for discharge area concept',
    _default: '89ebccf1-4cca-4195-aeff-3e75fdf976b4',
    _default: '89ebccf1-4cca-4195-aeff-3e75fdf976b4',
  },
  adminUuid: {
    _type: Type.String,
    _description: 'UUID for admin user',
    _default: 'e02c40e5-04e7-11e5-ae3c-a0b3cc4f922f',
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
  morgueDischargeEncounterTypeUuid: string;
  adminUuid: string;
};
