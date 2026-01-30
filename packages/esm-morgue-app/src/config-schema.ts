import { Type } from '@openmrs/esm-framework';
import _default from 'react-hook-form/dist/utils/createSubject';
import { queue } from 'rxjs';

export const configSchema = {
  mortuaryLocationTagUuid: {
    _type: Type.String,
    _description: 'UUID for mortuary location tag',
    _default: '1dbbfe22-d21f-499c-bf33-cc9f75b6c7e8',
  },
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

  tagNumberUuid: {
    _type: Type.String,
    _description: 'UUID for tag number concept',
    _default: 'f2b35679-7ba9-4619-92cb-6872b0c6bf57',
  },
  morgueAdmissionEncounterTypeUuid: {
    _type: Type.String,
    _description: 'Encounter type for morgue admission',
    _default: '3d2df845-6f3c-45e7-b91a-d828a1f9c2e8',
  },
  morgueDischargeEncounterTypeUuid: {
    _type: Type.String,
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
  nextOfKinNationalIdUuid: {
    _type: Type.String,
    _description: 'UUID for next of kin national ID concept',
    _default: '73d34479-2f9e-4de3-a5e6-1f79a17459bb',
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
  autopsyFormUuid: {
    _type: Type.String,
    _description: 'UUID for autopsy form',
    _default: '2b61a73-4971-4fc0-b20b-9a30176317e2',
  },
  autopsyEncounterFormUuid: {
    _type: Type.String,
    _description: 'Encounter UUID for autopsy',
    _default: '465a92f2-baf8-42e9-9612-53064be868e8',
  },
  courtOrderCaseNumberUuid: {
    _type: Type.String,
    _description: 'UUID for court order case number concept',
    _default: '26e0da6c-3e53-4f7d-9a3a-1c2f634450f7',
  },
  serialNumberUuid: {
    _type: Type.String,
    _description: 'UUID for serial number concept',
    _default: '1646AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  receivingAreaUuid: {
    _type: Type.String,
    _description: 'UUID for receiving area concept',
    _default: '159495AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  reasonForTransferUuid: {
    _type: Type.String,
    _description: 'UUID for reason for transfer concept',
    _default: '162720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  locationOfDeathQuestionUuid: {
    _type: Type.String,
    _description: 'UUID for location of death question concept',
    _default: '1541AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  locationOfDeathTypesList: {
    _type: Type.Array,
    _description: 'List of location of death types',
    _default: [
      {
        concept: '1589AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'InPatient',
      },
      {
        concept: '160473AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'Outpatient',
      },
      {
        concept: '1601AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'Dead on arrival',
      },
      {
        concept: '1536AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'Home',
      },
      {
        concept: '1067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'Unknown (Police case)',
      },
    ],
  },
  deathConfirmationTypes: {
    _type: Type.Array,
    _description: 'List of death confirmation types',
    _default: [
      {
        concept: '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'Yes',
      },
      {
        concept: '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'No',
      },
    ],
  },
  deathConfirmationQuestionUuid: {
    _type: Type.String,
    _description: 'UUID for death confirmation question concept',
    _default: '165793AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  deathNotificationUuid: {
    _type: Type.String,
    _description: 'UUID for death notification concept',
    _default: '162727AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  attendingClinicianUuid: {
    _type: Type.String,
    _description: 'UUID for attending clinician concept',
    _default: '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  doctorRemarksUuid: {
    _type: Type.String,
    _description: 'UUID for doctor remarks concept',
    _default: '161011AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  causeOfDeathUuid: {
    _type: Type.String,
    _description: 'UUID for cause of death concept',
    _default: '160218AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  deadBodyPreservationTypeUuid: {
    _type: Type.Array,
    _description: 'List of dead body preservation types',
    _default: [
      {
        concept: 'bb78fcee-99c8-4073-9224-69c668917405',
        label: 'Body embalment',
      },
      {
        concept: '167231AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'Cold storage',
      },
    ],
  },
  deadBodyPreservationQuestionUuid: {
    _type: Type.String,
    _description: 'UUID for dead body preservation question concept',
    _default: 'c67be9a5-f497-4082-af81-11753f65ed4b',
  },
  bodyEmbalmmentTypesUuid: {
    _type: Type.Array,
    _description: 'List of body embalmment types',
    _default: [
      {
        concept: '166402AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'Arterial',
      },
      {
        concept: '160494AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'Cavity',
      },
      {
        concept: '151870AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        label: 'Hypodermic',
      },
    ],
  },
  autopsyPermissionUuid: {
    _type: Type.String,
    _description: 'UUID for autopsy permission concept',
    _default: '1707AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  nameOfReceivingMortuaryUuid: {
    _type: Type.String,
    _description: 'UUID for facility receiving mortuary concept',
    _default: '7dd18ca4-a060-4f2c-b1dc-473d39d6488b',
  },
  otherFacilityMortuaryUuid: {
    _type: Type.String,
    _description: 'UUID for other facility receiving mortuary concept',
    _default: '0d3ef415-c537-4ec8-ae7b-dd44bac03482',
  },
  currentMortuaryUuid: {
    _type: Type.String,
    _description: 'UUID for current mortuary concept',
    _default: '38a6f2a8-c698-4519-9f46-3b3564d35a53',
  },
  transferToQuestionUuid: {
    _type: Type.String,
    _description: 'UUID for transfer to question concept',
    _default: 'eeae72dc-a7e6-44af-bf20-a39d441353b6',
  },
  icd11DataSourceUuid: {
    _type: Type.String,
    _description: 'UUID for ICD-11 data source',
    _default: '39ADDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  },
  mortuaryQueueUuid: {
    _type: Type.String,
    _description: 'UUID for mortuary queue',
    _default: 'eea71500-f41f-474d-aca1-529af6083914',
  },
  mortuaryQueueStatusUuid: {
    _type: Type.String,
    _description: 'UUID for queue status',
    _default: '167407AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  mortuaryNotUrgentPriorityUuid: {
    _type: Type.String,
    _description: 'UUID for queue priority',
    _default: '80cd8f8c-5d82-4cdc-b96e-a6addeb94b7f',
  },
  mortalityEncounterTypeUuid: {
    _type: Type.String,
    _description: 'UUID for mortality encounter type',
    _default: 'd5a9963b-5656-4c20-9b6b-1a195650c8d8',
  },
  patientIdentifierTypeUuid: {
    _type: Type.UUID,
    _default: 'dfacd928-0370-4315-99d7-6ec1c9f7ae76',
    _description: 'UUID for the patient Opennmrs identifier type to display',
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
  mortuaryLocationTagUuid: string;
  tagNumberUuid: string;
  morgueAdmissionEncounterTypeUuid: string;
  nextOfKinNameUuid: string;
  nextOfKinRelationshipUuid: string;
  nextOfKinNationalIdUuid: string;
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
  autopsyFormUuid: string;
  autopsyEncounterFormUuid: string;
  courtOrderCaseNumberUuid: string;
  serialNumberUuid: string;
  receivingAreaUuid: string;
  reasonForTransferUuid: string;
  locationOfDeathQuestionUuid: string;
  locationOfDeathTypesList: Array<{ concept: string; label: string }>;
  deathConfirmationTypes: Array<{ concept: string; label: string }>;
  deathConfirmationQuestionUuid: string;
  deathNotificationUuid: string;
  attendingClinicianUuid: string;
  doctorRemarksUuid: string;
  causeOfDeathUuid: string;
  deadBodyPreservationTypeUuid: Array<{ concept: string; label: string }>;
  deadBodyPreservationQuestionUuid: string;
  bodyEmbalmmentTypesUuid: Array<{ concept: string; label: string }>;
  autopsyPermissionUuid: string;
  nameOfReceivingMortuaryUuid: string;
  otherFacilityMortuaryUuid: string;
  currentMortuaryUuid: string;
  transferToQuestionUuid: string;
  icd11DataSourceUuid: string;
  mortuaryQueueUuid: string;
  mortuaryQueueStatusUuid: string;
  mortuaryNotUrgentPriorityUuid: string;
  mortalityEncounterTypeUuid: string;
  patientIdentifierTypeUuid: string;
};
