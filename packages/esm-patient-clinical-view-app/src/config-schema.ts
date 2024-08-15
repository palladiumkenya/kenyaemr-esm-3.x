import { Type } from '@openmrs/esm-framework';
import _default from 'react-hook-form/dist/logic/appendErrors';

export const configSchema = {
  encounterTypes: {
    _type: Type.Object,
    _description: 'List of encounter type UUIDs',
    _default: {
      mchMotherConsultation: 'c6d09e05-1f25-4164-8860-9f32c5a02df0',
      hivTestingServices: '9c0a7a57-62ff-4f75-babe-5835b0e921b7',
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
        formUuid: 'dbe7db2d-abed-47b6-904f-1308b997d7bf',
        encounterTypeUuid: '4224f8bf-11b2-4e47-a958-1dbdfd7fa41d',
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
    },
  },
  defaulterTracingEncounterUuid: {
    _type: Type.String,
    _description: 'Encounter UUID for defaulter tracing',
    _default: '1495edf8-2df2-11e9-b210-d663bd873d93',
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
};

export interface ConfigObject {
  caseManagementForms: Array<{ id: string; title: string; formUuid: string; encounterTypeUuid: string }>;
  encounterTypes: { mchMotherConsultation: string; hivTestingServices: string };
  formsList: {
    labourAndDelivery: string;
    antenatal: string;
    postnatal: string;
    htsScreening: string;
    htsInitialTest: string;
    htsRetest: string;
    defaulterTracingFormUuid: string;
    clinicalEncounterFormUuid: string;
  };
  defaulterTracingEncounterUuid: string;
  clinicalEncounterUuid: string;
  registrationEncounterUuid: string;
  openmrsIDUuid: string;
  openmrsIdentifierSourceUuid: string;
  maritalStatusUuid: string;
  hivProgramUuid: string;
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
