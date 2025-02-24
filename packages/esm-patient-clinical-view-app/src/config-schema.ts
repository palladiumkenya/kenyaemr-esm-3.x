import { Type } from '@openmrs/esm-framework';
import _default from 'react-hook-form/dist/logic/appendErrors';

export const configSchema = {
  encounterTypes: {
    _type: Type.Object,
    _description: 'List of encounter type UUIDs',
    _default: {
      mchMotherConsultation: 'c6d09e05-1f25-4164-8860-9f32c5a02df0',
      hivTestingServices: '9c0a7a57-62ff-4f75-babe-5835b0e921b7',
      kpPeerCalender: 'c4f9db39-2c18-49a6-bf9b-b243d673c64d',
    },
  },
  caseManagementForms: {
    _type: Type.Array,
    _description: 'List of form and encounter UUIDs',
    _default: [
      {
        id: 'high-iit-intervention',
        title: 'High IIT Intervention Form',
        formUuid: '6817d322-f938-4f38-8ccf-caa6fa7a499f',
        encounterTypeUuid: '84d66c25-e2bd-48a2-8686-c1652eb9d283',
      },
      {
        id: 'home-visit-checklist',
        title: 'Home Visit Checklist Form',
        formUuid: 'ac3152de-1728-4786-828a-7fb4db0fc384',
        encounterTypeUuid: 'bfbb5dc2-d3e6-41ea-ad86-101336e3e38f',
      },
    ],
  },
  formsList: {
    _type: Type.Object,
    _description: 'List of form UUIDs',
    _default: {
      antenatal: 'e8f98494-af35-4bb8-9fc7-c409c8fed843',
      postNatal: '72aa78e0-ee4b-47c3-9073-26f3b9ecc4a7',
      labourAndDelivery: '496c7cc3-0eea-4e84-a04c-2292949e2f7f',
      defaulterTracingFormUuid: 'a1a62d1e-2def-11e9-b210-d663bd873d93',
      htsScreening: '04295648-7606-11e8-adc0-fa7ae01bbebc',
      htsInitialTest: '402dc5d7-46da-42d4-b2be-f43ea4ad87b0',
      htsRetest: 'b08471f6-0892-4bf7-ab2b-bf79797b8ea4',
      htsLinkage: '050a7f12-5c52-4cad-8834-863695af335d',
      htsReferral: '9284828e-ce55-11e9-a32f-2a2ae2dbcce4',
      clinicalEncounterFormUuid: 'e958f902-64df-4819-afd4-7fb061f59308',
      peerCalendarOutreactForm: '7492cffe-5874-4144-a1e6-c9e455472a35',
      autopsyFormUuid: '2b61a73-4971-4fc0-b20b-9a30176317e2',
    },
  },
  defaulterTracingEncounterUuid: {
    _type: Type.String,
    _description: 'Encounter UUID for defaulter tracing',
    _default: '1495edf8-2df2-11e9-b210-d663bd873d93',
  },
  autopsyEncounterFormUuid: {
    _type: Type.String,
    _description: 'Encounter UUID for autopsy',
    _default: '32b61a73-4971-4fc0-b20b-9a30176317e2',
  },
  clinicalEncounterUuid: {
    _type: Type.String,
    _description: 'Clinical Encounter UUID',
    _default: '465a92f2-baf8-42e9-9612-53064be868e8',
  },
  concepts: {
    probableCauseOfDeathConceptUuid: {
      _type: Type.ConceptUuid,
      _description:
        'Probable cause of death for a given patient determined from interviewing a family member or other non-medical personnel as part of a death registry questionnaire',
      _default: '1599AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    problemListConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'List of given problems for a given patient',
      _default: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  specialClinics: {
    _type: Type.Array,
    _description: 'List of special clinics',
    _default: [
      {
        id: 'renal-clinic',
        title: 'Renal',
        formUuid: '6d0be8bd-5320-45a0-9463-60c9ee2b1338',
        encounterTypeUuid: '465a92f2-baf8-42e9-9612-53064be868e8',
      },
      {
        id: 'physiotherapy-clinic',
        title: 'Physiotherapy',
        formUuid: 'fdada8da-75fe-44c6-93e1-782d41e5565b',
        encounterTypeUuid: '465a92f2-baf8-42e9-9612-53064be868e8',
      },
      {
        id: 'dental-clinic',
        title: 'Dental',
        formUuid: 'a3c01460-c346-4f3d-a627-5c7de9494ba0',
        encounterTypeUuid: '465a92f2-baf8-42e9-9612-53064be868e8',
      },
      {
        id: 'fertility-clinic',
        title: 'Fertility',
        formUuid: '32e43fc9-6de3-48e3-aafe-3b92f167753d',
        encounterTypeUuid: '465a92f2-baf8-42e9-9612-53064be868e8',
      },
    ],
  },
  registrationEncounterUuid: {
    _type: Type.String,
    _description: 'Registration encounter UUID',
    _default: 'de1f9d67-b73e-4e1b-90d0-036166fc6995',
  },
  registrationObs: {
    encounterTypeUuid: {
      _type: Type.UUID,
      _default: null,
      _description:
        'Obs created during registration will be associated with an encounter of this type. This must be set in order to use fields of type `obs`.',
    },
    encounterProviderRoleUuid: {
      _type: Type.UUID,
      _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
      _description: "The provider role to use for the registration encounter. Default is 'Unkown'.",
    },
    registrationFormUuid: {
      _type: Type.UUID,
      _default: null,
      _description:
        'The form UUID to associate with the registration encounter. By default no form will be associated.',
    },
  },
  openmrsIDUuid: {
    _type: Type.String,
    _description: 'OpenMRS Identifier  UUID',
    _default: 'dfacd928-0370-4315-99d7-6ec1c9f7ae76',
  },
  maritalStatusUuid: {
    _type: Type.String,
    _description: 'Marital status concept UUID',
    _default: '1054AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  openmrsIdentifierSourceUuid: {
    _type: Type.String,
    _description: 'OpenMRS Identifier Source UUID (Identifier Generator for OpenMRS ID)',
    _default: 'fb034aac-2353-4940-abe2-7bc94e7c1e71',
  },
  hivProgramUuid: {
    _type: Type.String,
    _description: 'HIV Program UUID',
    _default: 'dfdc6d40-2f2f-463d-ba90-cc97350441a8',
  },
  kvpProgramUuid: {
    _type: Type.String,
    _description: 'KVP Program UUID',
    _default: '7447305a-18a7-11e9-ab14-d663bd873d93',
  },
  contactPersonAttributesUuid: {
    _type: Type.Object,
    _description: 'Contact created patient attributes UUID',
    _default: {
      telephone: 'b2c38640-2603-4629-aebd-3b54f33f1e3a',
      baselineHIVStatus: '3ca03c84-632d-4e53-95ad-91f1bd9d96d6',
      contactCreated: '7c94bd35-fba7-4ef7-96f5-29c89a318fcf',
      preferedPnsAproach: '59d1b886-90c8-4f7f-9212-08b20a9ee8cf',
      livingWithContact: '35a08d84-9f80-4991-92b4-c4ae5903536e',
      contactIPVOutcome: '49c543c2-a72a-4b0a-8cca-39c375c0726f',
    },
  },
  familyRelationshipsTypeList: {
    _type: Type.Array,
    _description: 'List of Family relationship types (Used to list contacts)',
    _default: [
      {
        uuid: '8d91a01c-c2cc-11de-8d13-0010c6dffd0f',
        display: 'Sibling/Sibling',
      },
      {
        uuid: '8d91a210-c2cc-11de-8d13-0010c6dffd0f',
        display: 'Parent/Child',
      },
      {
        uuid: '8d91a3dc-c2cc-11de-8d13-0010c6dffd0f',
        display: 'Aunt/Uncle/Niece/Nephew',
      },
      {
        uuid: '5f115f62-68b7-11e3-94ee-6bef9086de92',
        display: 'Guardian/Dependant',
      },
      {
        uuid: 'd6895098-5d8d-11e3-94ee-b35a4132a5e3',
        display: 'Spouse/Spouse',
      },
      {
        uuid: '007b765f-6725-4ae9-afee-9966302bace4',
        display: 'Partner/Partner',
      },
      {
        uuid: '2ac0d501-eadc-4624-b982-563c70035d46',
        display: 'Co-wife/Co-wife',
      },
      {
        uuid: '58da0d1e-9c89-42e9-9412-275cef1e0429',
        display: 'Injectable-drug-user/Injectable-druguser',
      },
      {
        uuid: '76edc1fe-c5ce-4608-b326-c8ecd1020a73',
        display: 'SNS/SNS',
      },
    ],
  },
  peerEducatorRelationship: {
    _type: Type.String,
    _description: 'Peer Educator Relationship type',
    _default: '96adecc2-e7cd-41d0-b577-08eb4834abcb',
  },
  pnsRelationships: {
    _type: Type.Array,
    _description: 'List of Patner relationship (PNS - Patner Notification Service)',
    _default: [
      {
        uuid: 'd6895098-5d8d-11e3-94ee-b35a4132a5e3',
        display: 'Spouse/Spouse',
        sexual: true,
      },
      {
        uuid: '007b765f-6725-4ae9-afee-9966302bace4',
        display: 'Partner/Partner',
        sexual: true,
      },
      {
        uuid: '2ac0d501-eadc-4624-b982-563c70035d46',
        display: 'Co-wife/Co-wife',
        sexual: false,
      },
      {
        uuid: '58da0d1e-9c89-42e9-9412-275cef1e0429',
        display: 'Injectable-drug-user/Injectable-druguser',
        sexual: false,
      },
    ],
  },
  admissionLocationTagUuid: {
    _type: Type.UUID,
    _description:
      'UUID for the location tag of the `Admission Location`. Patients may only be admitted to inpatient care in a location with this tag',
    _default: '233de33e-2778-4f9a-a398-fa09da9daa14',
  },
  inpatientVisitUuid: {
    _type: Type.UUID,
    _description: 'UUID for the inpatient visit',
    _default: 'a73e2ac6-263b-47fc-99fc-e0f2c09fc914',
  },
  morgueVisitTypeUuid: {
    _type: Type.String,
    _description: ' UUID for morgue visit',
    _default: '02b67c47-6071-4091-953d-ad21452e830c',
  },
  morgueDischargeEncounterUuid: {
    _type: Type.String,
    _description: ' UUID for morgue discharge encounter uuid',
    _default: '3d618f40b-b5a3-4f17-81c8-2f04e2aad58e',
  },
  inPatientForms: {
    _type: Type.Array,
    _description: 'List of forms that can be filled out for in-patients',
    _default: [
      {
        label: 'Cardex Nursing Plan',
        uuid: '89891ea0-444f-48bf-98e6-f97e87607f7e',
      },
      {
        label: 'IPD Procedure Form',
        uuid: '3853ed6d-dddd-4459-b441-25cd6a459ed4',
      },
      {
        label: 'Newborn Unit Admission ',
        uuid: 'e8110437-e3cc-4238-bfc1-414bdd4de6a4',
      },
      {
        label: 'Partograph Form',
        uuid: '3791e5b7-2cdc-44fc-982b-a81135367c96',
      },
    ],
  },
};

export interface ConfigObject {
  peerEducatorRelationship: string;
  morgueVisitTypeUuid: string;
  morgueDischargeEncounterUuid: string;
  caseManagementForms: Array<{ id: string; title: string; formUuid: string; encounterTypeUuid: string }>;
  peerCalendarOutreactForm: string;
  encounterTypes: { mchMotherConsultation: string; hivTestingServices: string; kpPeerCalender: string };
  formsList: {
    labourAndDelivery: string;
    antenatal: string;
    postnatal: string;
    htsScreening: string;
    htsInitialTest: string;
    htsRetest: string;
    defaulterTracingFormUuid: string;
    clinicalEncounterFormUuid: string;
    peerCalendarOutreactForm: string;
    autopsyFormUuid: string;
  };
  defaulterTracingEncounterUuid: string;
  autopsyEncounterFormUuid: string;
  clinicalEncounterUuid: string;
  registrationEncounterUuid: string;
  registrationObs: {
    encounterTypeUuid: string | null;
    encounterProviderRoleUuid: string;
    registrationFormUuid: string | null;
  };
  openmrsIDUuid: string;
  openmrsIdentifierSourceUuid: string;
  maritalStatusUuid: string;
  hivProgramUuid: string;
  kvpProgramUuid: string;
  concepts: Record<string, string>;
  specialClinics: Array<{ id: string; formUuid: string; encounterTypeUuid: string; title: string }>;
  contactPersonAttributesUuid: {
    telephone: string;
    baselineHIVStatus: string;
    contactCreated: string;
    preferedPnsAproach: string;
    livingWithContact: string;
    contactIPVOutcome: string;
  };
  familyRelationshipsTypeList: Array<{ uuid: string; display: string }>;
  pnsRelationships: Array<{ uuid: string; display: string; sexual: boolean }>;
  admissionLocationTagUuid: {
    _type: Type.UUID;
    _description: 'UUID for the location tag of the `Admission Location`. Patients may only be admitted to inpatient care in a location with this tag';
    _default: '233de33e-2778-4f9a-a398-fa09da9daa14';
  };
  inpatientVisitUuid: {
    _type: Type.UUID;
    _description: 'UUID for the inpatient visit';
    _default: 'a73e2ac6-263b-47fc-99fc-e0f2c09fc914';
  };
  restrictWardAdministrationToLoginLocation: {
    _type: Type.Boolean;
    _description: 'UUID for the inpatient visit';
    _default: false;
  };
  patientListForAdmissionUrl: {
    _type: Type.String;
    _description: 'Endpoint for fetching list of patients eligible for ward admission';
    _default: '';
  };
  inPatientForms: {
    _type: Type.Array;
    _description: 'List of forms that can be filled out for in-patients';
    _default: [
      {
        label: 'Cardex Nursing Plan';
        uuid: '89891ea0-444f-48bf-98e6-f97e87607f7e';
      },
      {
        label: 'IPD Procedure Form';
        uuid: '3853ed6d-dddd-4459-b441-25cd6a459ed4';
      },
      {
        label: 'Newborn Unit Admission ';
        uuid: 'e8110437-e3cc-4238-bfc1-414bdd4de6a4';
      },
      {
        label: 'Partograph Form';
        uuid: '3791e5b7-2cdc-44fc-982b-a81135367c96';
      },
    ];
  };
}

export interface PartograpyComponents {
  id: string;
  date: string;
  fetalHeartRate: number;
  cervicalDilation: number;
  descentOfHead: string;
}
export interface ConfigPartographyObject {
  concepts: {
    obsDateUiid: string;
    timeRecordedUuid: string;
    fetalHeartRateUuid: string;
    cervicalDilationUiid: string;
    descentOfHead: string;
  };
}

export type BedManagementConfig = {
  admissionLocationTagUuid: string;
  inpatientVisitUuid: string;
  restrictWardAdministrationToLoginLocation: boolean;
  patientListForAdmissionUrl: string;
  inPatientForms: Array<{ label: string; uuid: string }>;
};
