import { Type } from '@openmrs/esm-framework';

export interface CarePanelConfig {
  regimenObs: {
    encounterProviderRoleUuid: string;
  };
  hivProgramUuid: string;
  dispensingVitalsConcepts: Array<{
    uuid: string;
    display: string;
  }>;
  careProgramForms: Array<{
    programName: string;
    programUuid: string;
    forms: {
      formName: string;
      formUuId: string;
      dependancies: string[];
    }[];
  }>;
  peerEducatorRelationshipType: string;
  peerCalendarOutreactForm: string;
  hideFilledProgramForm: boolean;
}

export const configSchema = {
  regimenObs: {
    encounterProviderRoleUuid: {
      _type: Type.UUID,
      _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
      _description: "The provider role to use for the regimen encounter. Default is 'Unkown'.",
    },
  },
  hivProgramUuid: {
    _type: Type.String,
    _description: 'HIV Program UUID',
    _default: 'dfdc6d40-2f2f-463d-ba90-cc97350441a8',
  },
  dispensingVitalsConcepts: {
    _type: Type.Array,
    _description: 'Uuids of patient vitals concept required for dispensing',
    _default: [
      {
        display: 'Weight (Kg)',
        uuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
    ],
  },
  peerEducatorRelationshipType: {
    _type: Type.UUID,
    _description: 'Case Manager/Client Relationship type Uuid',
    _default: '9065e3c6-b2f5-4f99-9cbf-f67fd9f82ec5',
  },
  peerCalendarOutreactForm: {
    _type: Type.UUID,
    _description: 'Peer Calendar Outreach form UUID',
    _default: '7492cffe-5874-4144-a1e6-c9e455472a35',
  },
  hideFilledProgramForm: {
    _type: Type.Boolean,
    _description: 'Hide already filled program forms in care panel',
    _default: true,
  },
  careProgramForms: {
    _type: Type.Array,
    _description: 'Programs forms mapping with dependancy configuration',
    _default: [
      {
        programName: 'PNC',
        programUuid: '286598d5-1886-4f0d-9e5f-fa5473399cee',
        forms: [
          { formName: 'MCH Postnatal Visit Form', formUuId: '72aa78e0-ee4b-47c3-9073-26f3b9ecc4a7', dependancies: [] },
          {
            formName: 'PNC Services Discontinuation',
            formUuId: '30db888b-d6d3-47fb-b0c9-dbdf10a57ff5',
            dependancies: [],
          },
        ],
      },
      {
        programName: 'ANC',
        programUuid: '72635673-0613-4259-916e-e0d5d5ef8f66',
        forms: [
          { formName: 'MCH Antenatal Visit', formUuId: 'e8f98494-af35-4bb8-9fc7-c409c8fed843', dependancies: [] },
          {
            formName: 'ANC Follow Up form',
            formUuId: '6fb1a39b-0a57-4239-afd7-a5490d281cb9',
            dependancies: ['e8f98494-af35-4bb8-9fc7-c409c8fed843'],
          },
          {
            formName: 'Antenatal Care (ANC) Discontinuation',
            formUuId: '38885518-c71a-4661-8edf-3db67707e1d1',
            dependancies: ['e8f98494-af35-4bb8-9fc7-c409c8fed843'],
          },
        ],
      },
      {
        programName: 'MCH - Child Services', // cwc
        programUuid: 'c2ecdf11-97cd-432a-a971-cfd9bd296b83',
        forms: [
          { formName: 'Child welfare clinic form', formUuId: '755b59e6-acbb-4853-abaf-be302039f902', dependancies: [] }, // CWC followup
          {
            formName: 'Child Welfare Services Discontinuation',
            formUuId: '1dd02c43-904b-4206-8378-7b1a8414c326',
            dependancies: [],
          },
        ],
      },
      {
        programName: 'Nutrition',
        programUuid: '504f179b-4a13-4790-9ecd-ca4963448af8',
        forms: [
          { formName: 'Nutrition form', formUuId: 'b8357314-0f6a-4fc9-a5b7-339f47095d62', dependancies: [] },
          {
            formName: 'Nutrition Services Discontinuation',
            formUuId: '0648a046-f404-4246-806f-c9ee78232d6d',
            dependancies: [],
          },
        ],
      },
      {
        programName: 'Family Planning',
        programUuid: '191269d2-9973-4958-9936-f687ed771050',
        forms: [
          { formName: 'Family Planning Form', formUuId: 'a52c57d4-110f-4879-82ae-907b0d90add6', dependancies: [] },
          {
            formName: 'Family Planning Discontinuation',
            formUuId: 'efc782ea-9a16-4791-824a-18be7417eda4',
            dependancies: [],
          },
        ],
      },
      {
        programName: 'TB',
        programUuid: '9f144a34-3a4a-44a9-8486-6b7af6cc64f6',
        forms: [
          {
            formName: 'TB Enrollment',
            formUuId: '89994550-9939-40f3-afa6-173bce445c79',
            dependancies: [],
            isEnrollment: true,
          },
          {
            formName: 'TB Initial',
            formUuId: '6a4f7090-f496-46d2-b582-5ac7e71a16e4',
            dependancies: [],
            isEnrollment: false,
          },
          {
            formName: 'TB FollowUp',
            formUuId: '2daabb77-7ad6-4952-864b-8d23e109c69d',
            dependancies: ['89994550-9939-40f3-afa6-173bce445c79', '6a4f7090-f496-46d2-b582-5ac7e71a16e4'],
            isEnrollment: false,
          },
          {
            formName: 'TB Discontinuation',
            formUuId: '4b296dd0-f6be-4007-9eb8-d0fd4e94fb3a',
            dependancies: ['89994550-9939-40f3-afa6-173bce445c79', '6a4f7090-f496-46d2-b582-5ac7e71a16e4'],
            isEnrollment: false,
          },
        ],
      },
      {
        programName: 'Violence screening',
        programUuid: 'e41c3d74-37c7-4001-9f19-ef9e35224b70',
        forms: [
          {
            formName: 'Violence enrollment',
            formUuId: '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
            dependancies: [],
            isEnrollment: true,
          },
          {
            formName: 'Violence Initial Form',
            formUuId: 'e182d25f-d824-4cc7-8e0c-188519c300aa',
            dependancies: [],
            isEnrollment: false,
          },
          {
            formName: 'Violence Screening',
            formUuId: '03767614-1384-4ce3-aea9-27e2f4e67d01',
            dependancies: [],
            isEnrollment: false,
          },
          {
            formName: 'Violence Reporting Form',
            formUuId: '10cd2ca0-8d25-4876-b97c-b568a912957e',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          },
          {
            formName: 'Violence Consent Form',
            formUuId: 'd720a8b3-52cc-41e2-9a75-3fd0d67744e5',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          },
          {
            formName: 'Sexual Violence post rape care 363A',
            formUuId: 'c46aa4fd-8a5a-4675-90a7-a6f2119f61d8',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          }, // PRC Form Part A
          {
            formName: 'Sexual Violence PRC Psychological Assessment 363B',
            formUuId: '9d21275a-7657-433a-b305-a736423cc496',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          }, // PRC Form Part B
          {
            formName: 'Physical and Emotional Violence Form',
            formUuId: 'a0943862-f0fe-483d-9f11-44f62abae063',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          },
          {
            formName: 'Violence Trauma Counselling',
            formUuId: 'e983d758-5adf-4917-8172-0f4be4d8116a',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          },
          {
            formName: 'Violence Community Linkage Form',
            formUuId: 'f760e38c-3d2f-4a5d-aa3d-e9682576efa8',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          },
          {
            formName: 'Violence Legal Form',
            formUuId: 'd0c36426-4503-4236-ab5d-39bff77f2b50',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          },
          {
            formName: 'Violence Perpetrator Details',
            formUuId: 'f37d7e0e-95e8-430d-96a3-8e22664f74d6',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          },
          {
            formName: 'PEP FOLLOWUP Form',
            formUuId: '155ccbe2-a33f-4a58-8ce6-57a7372071ee',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          },
          {
            formName: 'Violence Discontinuation Form',
            formUuId: '8fed3d06-f8a1-4cb8-b853-cd93394bab79',
            dependancies: [
              '9ba1d4aa-57d7-48f9-a635-a23508e8136c',
              'e182d25f-d824-4cc7-8e0c-188519c300aa',
              '03767614-1384-4ce3-aea9-27e2f4e67d01',
            ],
            isEnrollment: false,
          },
        ],
      },
      {
        programName: 'TPT',
        programUuid: '335517a1-04bc-438b-9843-1ba49fb7fcd9',
        forms: [
          {
            formName: 'TPT Initiation',
            formUuId: '61ea2a72-b0f9-47cf-ae86-443f88656acc',
            dependancies: [],
            isEnrollment: true,
          },
          {
            formName: 'TPT Initial',
            formUuId: '9d75d6c7-2db8-44ba-8068-f1b3601a1cb9',
            dependancies: [],
            isEnrollment: false,
          },
          {
            formName: 'TPT FollowUp',
            formUuId: '9d0e4be8-ab72-4394-8df7-b509b9d45179',
            dependancies: ['61ea2a72-b0f9-47cf-ae86-443f88656acc', '9d75d6c7-2db8-44ba-8068-f1b3601a1cb9'],
            isEnrollment: false,
          },
          {
            formName: 'TPT Outcome/Discontinuation',
            formUuId: '5bdd3b65-8b7b-46a0-9f7b-dfe764143848',
            dependancies: ['61ea2a72-b0f9-47cf-ae86-443f88656acc', '9d75d6c7-2db8-44ba-8068-f1b3601a1cb9'],
            isEnrollment: false,
          },
        ],
      },
      {
        programName: 'PrEP',
        programUuid: '214cad1c-bb62-4d8e-b927-810a046daf62',
        forms: [
          {
            formName: 'PrEP INITIATION',
            formUuId: 'd5ca78be-654e-4d23-836e-a934739be555',
            dependancies: [],
            isEnrollment: true,
          },
          {
            formName: 'PrEP Initial Enrollment Form',
            formUuId: 'd63eb2ee-d5e8-4ea4-b5ea-ea3670af03ac',
            dependancies: [],
            isEnrollment: false,
          },
          {
            formName: 'PrEP Initial Form',
            formUuId: '1bfb09fc-56d7-4108-bd59-b2765fd312b8',
            dependancies: ['d5ca78be-654e-4d23-836e-a934739be555', 'd63eb2ee-d5e8-4ea4-b5ea-ea3670af03ac'],
            isEnrollment: false,
          },
          {
            formName: 'PrEP Follow Up',
            formUuId: 'ee3e2017-52c0-4a54-99ab-ebb542fb8984',
            dependancies: ['d5ca78be-654e-4d23-836e-a934739be555', 'd63eb2ee-d5e8-4ea4-b5ea-ea3670af03ac'],
            isEnrollment: false,
          },
          {
            formName: 'PrEP Monthly Refill Form',
            formUuId: '291c03c8-a216-11e9-a2a3-2a2ae2dbcce4',
            dependancies: ['d5ca78be-654e-4d23-836e-a934739be555', 'd63eb2ee-d5e8-4ea4-b5ea-ea3670af03ac'],
            isEnrollment: false,
          },
        ],
      },
      {
        programName: 'NCD',
        programUuid: 'ffee43c4-9ccd-4e55-8a70-93194e7fafc6',
        forms: [
          { formName: 'NCD Initial Form', formUuId: 'c4994dd7-f2b6-4c28-bdc7-8b1d9d2a6a97', dependancies: [] },
          {
            formName: 'NCD Follow Up',
            formUuId: '3e1057da-f130-44d9-b2bb-53e039b953c6',
            dependancies: ['c4994dd7-f2b6-4c28-bdc7-8b1d9d2a6a97'],
          },
          {
            formName: 'NCD Discontinuation',
            formUuId: '63182d28-a23f-4d14-b48e-38077bbd8ed2',
            dependancies: ['c4994dd7-f2b6-4c28-bdc7-8b1d9d2a6a97'],
          },
        ],
      },
      {
        programName: 'KVP',
        programUuid: '7447305a-18a7-11e9-ab14-d663bd873d93',
        forms: [
          {
            formName: 'KVP Contact Form',
            formUuId: '185dec84-df6f-4fc7-a370-15aa8be531ec',
            dependancies: [],
            isEnrollment: true,
          },
          {
            formName: 'KVP Initial Form',
            formUuId: 'ead9e306-f1e5-4ed8-aa7d-be9a55309b3c',
            dependancies: [],
            isEnrollment: true,
          },
          {
            formName: 'KVP Clinical Enrollment',
            formUuId: 'c7f47cea-207b-11e9-ab14-d663bd873d93',
            dependancies: ['185dec84-df6f-4fc7-a370-15aa8be531ec', 'ead9e306-f1e5-4ed8-aa7d-be9a55309b3c'],
            isEnrollment: false,
          },
          {
            formName: 'KVP Peer Educator Outreach Calendar',
            formUuId: '7492cffe-5874-4144-a1e6-c9e455472a35',
            dependancies: ['185dec84-df6f-4fc7-a370-15aa8be531ec', 'ead9e306-f1e5-4ed8-aa7d-be9a55309b3c'],
            isEnrollment: false,
          },
          {
            formName: 'KVP Clinical Encounter form',
            formUuId: '92e041ac-9686-11e9-bc42-526af7764f64',
            dependancies: [
              '185dec84-df6f-4fc7-a370-15aa8be531ec',
              'c7f47cea-207b-11e9-ab14-d663bd873d93',
              'ead9e306-f1e5-4ed8-aa7d-be9a55309b3c',
            ],
            isEnrollment: false,
          },
          {
            formName: 'KVP Client Discontinuation',
            formUuId: '1f76643e-2495-11e9-ab14-d663bd873d93',
            dependancies: [
              '185dec84-df6f-4fc7-a370-15aa8be531ec',
              'c7f47cea-207b-11e9-ab14-d663bd873d93',
              'ead9e306-f1e5-4ed8-aa7d-be9a55309b3c',
            ],
            isEnrollment: false,
          },
        ],
      },
      {
        programName: 'HIV Program',
        programUuid: 'dfdc6d40-2f2f-463d-ba90-cc97350441a8',
        forms: [
          {
            formName: 'HIV Enrollment',
            formUuId: 'e4b506c1-7379-42b6-a374-284469cba8da',
            dependancies: [],
            isEnrollment: true,
          },
          {
            formName: 'HIV Initial form',
            formUuId: '592fd92c-35f6-4dd8-8f0d-a401c1e5b2e2',
            dependancies: ['e4b506c1-7379-42b6-a374-284469cba8da', '592fd92c-35f6-4dd8-8f0d-a401c1e5b2e2'],
            isEnrollment: false,
          },
          {
            formName: 'ART Readyness',
            formUuId: '782a4263-3ac9-4ce8-b316-534571233f12',
            dependancies: ['e4b506c1-7379-42b6-a374-284469cba8da', '592fd92c-35f6-4dd8-8f0d-a401c1e5b2e2'],
            isEnrollment: false,
          }, // USING ART prepairation form (closest to readiness)
          {
            formName: 'HIV Green Card',
            formUuId: '22c68f86-bbf0-49ba-b2d1-23fa7ccf0259',
            dependancies: ['e4b506c1-7379-42b6-a374-284469cba8da', '592fd92c-35f6-4dd8-8f0d-a401c1e5b2e2'],
            isEnrollment: false,
          },
          {
            formName: 'HIV Discontinuation',
            formUuId: 'e3237ede-fa70-451f-9e6c-0908bc39f8b9',
            dependancies: ['e4b506c1-7379-42b6-a374-284469cba8da', '592fd92c-35f6-4dd8-8f0d-a401c1e5b2e2'],
            isEnrollment: false,
          },
        ],
      },
      {
        programName: 'Pre-Conception care program',
        programUuid: 'fd549de0-2e6d-4e76-a2c1-64df26351bdd',
        forms: [
          { formName: 'Pre- Conception Care', formUuId: '2cf38f9a-f910-492b-a055-e29924e513f8', dependancies: [] },
          {
            formName: 'Pre-Conception Discontinuation',
            formUuId: 'a9128c54-3a05-4d66-ba50-149565eadfd7',
            dependancies: [],
          },
        ],
      },
      {
        programName: 'Medical Assited therapy',
        programUuid: '4b898e20-9b2d-11ee-b9d1-0242ac120002',
        forms: [
          {
            formName: 'MAT Initial Registration Form',
            formUuId: '9a9cadd7-fba1-4a24-94aa-43edfbecf8d9',
            dependancies: [],
          },
          {
            formName: 'MAT Clinical Encounter Form',
            formUuId: '5ed937a0-0933-41c3-b638-63d8a4779845',
            dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
          },
          {
            formName: 'MAT Psycho-social Intake & Follow-up Form',
            formUuId: 'cfd2109b-63b3-43de-8bb3-682e80c5a965',
            dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
          },
          {
            formName: 'MAT Psychiatric Intake and Follow up Form',
            formUuId: 'fdea46a1-9423-4ef9-b780-93b32b48a528',
            dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
          },
          {
            formName: 'MAT Transit/Referral Form',
            formUuId: 'b9495048-eceb-4dd2-bfba-330dc4900ee9',
            dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
          },
          {
            formName: 'MAT Cessation Form',
            formUuId: 'fa58cbc1-91c8-4920-813b-fde7fd69533b',
            dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
          },
          {
            formName: 'MAT Discontinuation Form',
            formUuId: '38d6e116-b96c-4916-a821-b4dc83e2041d',
            dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
          },
        ],
      },
    ],
  },
};
