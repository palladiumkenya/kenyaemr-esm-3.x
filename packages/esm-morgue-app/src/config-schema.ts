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
  tagNumberUuid: {
    _type: Type.String,
    _description: 'UUID for tag number concept',
    _default: '9a953c7b-7aa2-481c-8aac-b8bc9be742ee',
  },
  policeStatementUuid: {
    _type: Type.String,
    _description: 'UUID for police statement concept',
    _default: ' 287d2d27-04e4-4cc0-864f-15295e476fa8',
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
  obNumberUuid: {
    _type: Type.String,
    _description: 'UUID for ob number concept',
    _default: '682bd161-1ff0-40d6-95b6-f7c5d955bb4d',
  },
  policeNameUuid: {
    _type: Type.String,
    _description: 'UUID for police name concept',
    _default: '18ad3028-94c5-4ac0-80de-97267bd96ffa',
  },
  burialPermitNumberUuid: {
    _type: Type.String,
    _description: 'UUID for burial permit number concept',
    _default: 'a4157d5d-deb2-438e-9948-8152ed1fe157',
  },
  policeIDNumber: {
    _type: Type.String,
    _description: 'UUID for police id number concept',
    _default: 'c8d5a5b4-6589-4833-83f4-af75d74d3d38',
  },
  encounterProviderRoleUuid: {
    _type: Type.UUID,
    _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
    _description: "The provider role to use for the registration encounter. Default is 'Unkown'.",
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
};
