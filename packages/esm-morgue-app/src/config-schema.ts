import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  morgueVisitTypeUuid: {
    _type: Type.String,
    _description: ' UUID for morgue visit',
    _default: '02b67c47-6071-4091-953d-ad21452e830c',
  },
  morgueDepartmentServiceTypeUuid: {
    _type: Type.String,
    _description: ' UUID for morgue department service type',
    _default: '5b9e6cd1-f836-4144-91e4-401c58dd62af',
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
    _default: 'f2b35679-7ba9-4619-92cb-6872b0c6bf57',
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
  nextOfKinNameUuid: {
    _type: Type.String,
    _description: 'UUID for next of kin name concept',
    _default: '830bef6d-b01f-449d-9f8d-ac0fede8dbd3',
  },
  nextOfKinRelationshipUuid: {
    _type: Type.String,
    _description: 'UUID for next of kin relationship concept',
    _default: 'd0aa9fd1-2ac5-45d8-9c5e-4317c622c8f5',
  },
  nextOfKinAddressUuid: {
    _type: Type.String,
    _description: 'UUID for next of kin address concept',
    _default: '7cf22bec-d90a-46ad-9f48-035952261294',
  },
  nextOfKinPhoneUuid: {
    _type: Type.String,
    _description: 'UUID for next of kin phone concept',
    _default: '342a1d39-c541-4b29-8818-930916f4c2dc',
  },
  visitPaymentMethodAttributeUuid: {
    _type: Type.String,
    _description: 'UUID for visit payment method attribute',
    _default: 'e6cb0c3b-04b0-4117-9bc6-ce24adbda802',
  },
  obNumberUuid: {
    _type: Type.String,
    _description: 'UUID for ob number concept',
    _default: '0dffecb3-2dc4-4d56-8cd4-56ba38579c69',
  },
  policeNameUuid: {
    _type: Type.String,
    _description: 'UUID for police name concept',
    _default: 'd889f05b-0d9b-462f-ae8e-2e9be79fd954',
  },
  burialPermitNumberUuid: {
    _type: Type.String,
    _description: 'UUID for burial permit number concept',
    _default: 'da524812-5600-4677-ba26-eb61eb925eef',
  },
  policeIDNumber: {
    _type: Type.String,
    _description: 'UUID for police id number concept',
    _default: '163084AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
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
  morgueVisitTypeUuid: string;
  morgueDepartmentServiceTypeUuid: string;
  insurancepaymentModeUuid: string;
  morgueCompartmentTagUuid: string;
  tagNumberUuid: string;
  morgueAdmissionEncounterType: string;
  nextOfKinNameUuid: string;
  nextOfKinRelationshipUuid: string;
  nextOfKinAddressUuid: string;
  nextOfKinPhoneUuid: string;
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
