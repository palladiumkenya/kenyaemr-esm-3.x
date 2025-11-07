export const FETAL_HEART_RATE_GRAPH_UUIDS = {
  fetalHeartRate: 'FETAL_HEART_RATE_CONCEPT',
  fetalHeartRateHour: 'FETAL_HEART_RATE_HOUR_CONCEPT',
  fetalHeartRateTime: 'FETAL_HEART_RATE_TIME_CONCEPT',
  fetalHeartRateNew: 'FETAL_HEART_RATE_NEW_CONCEPT',
};
import { Type } from '@openmrs/esm-framework';
import _default from 'react-hook-form/dist/logic/appendErrors';

export const configSchema = {
  complaintsConceptUuids: {
    _type: Type.Array,
    _description: 'List of complaint concept UUIDs',
    _default: ['160531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
  },
  complaints: {
    _type: Type.Object,
    _description: 'Complaints configuration',
    _default: {
      chiefComplaintConceptUuid: '160531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      complaintMemberConceptUuid: '5219AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      durationConceptUuid: '159368AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      onsetConceptUuid: 'd7a3441d-6aeb-49be-b7d6-b2a3bb39e78d',
    },
  },
  requireMaritalStatusOnAgeGreaterThanOrEqualTo: {
    _type: Type.Number,
    _description: 'Age in years',
    _default: 10,
  },
  encounterTypes: {
    _type: Type.Object,
    _description: 'List of encounter type UUIDs',
    _default: {
      mchMotherConsultation: 'c6d09e05-1f25-4164-8860-9f32c5a02df0',
      hivTestingServices: '9c0a7a57-62ff-4f75-babe-5835b0e921b7',
      kpPeerCalender: 'c4f9db39-2c18-49a6-bf9b-b243d673c64d',
      htsEcounterUuid: '9c0a7a57-62ff-4f75-babe-5835b0e921b7', // Used with Contact tracing
      triage: 'd1059fb9-a079-4feb-a749-eedd709ae542',
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
      admissionRequestFormUuid: '',
      defaulterTracingFormUuid: 'a1a62d1e-2def-11e9-b210-d663bd873d93',
      htsScreening: '04295648-7606-11e8-adc0-fa7ae01bbebc',
      htsInitialTest: '402dc5d7-46da-42d4-b2be-f43ea4ad87b0',
      htsRetest: 'b08471f6-0892-4bf7-ab2b-bf79797b8ea4',
      htsLinkage: '050a7f12-5c52-4cad-8834-863695af335d',
      htsReferral: '9284828e-ce55-11e9-a32f-2a2ae2dbcce4',
      clinicalEncounterFormUuid: 'e958f902-64df-4819-afd4-7fb061f59308',
      peerCalendarOutreactForm: '7492cffe-5874-4144-a1e6-c9e455472a35',
      autopsyFormUuid: '2b61a73-4971-4fc0-b20b-9a30176317e2',
      htsClientTracingFormUuid: '15ed03d2-c972-11e9-a32f-2a2ae2dbcce4',
      complaintsFormUuid: '37f6bd8d-586a-4169-95fa-5781f987fe62',
    },
  },
  htsClientTracingConceptsUuids: {
    _type: Type.Object,
    _description: 'Concept Uuids for hts client tracing',
    _default: {
      modeOfClienttracingConceptUuid: 'a55f9516-ddb6-47ec-b10d-cb99d1d0bd41',
      reasonNotContactedConceptUuid: '1779AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      tracingStatusConceptUuid: '159811AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      remarksConceptUuid: '163042AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
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
  relationshipTypesList: {
    _type: Type.Array,
    _description: 'List of Categorized relationship types',
    _default: [
      {
        uuid: '8d91a01c-c2cc-11de-8d13-0010c6dffd0f',
        display: 'Sibling/Sibling',
        category: ['family'],
      },
      {
        uuid: '8d91a210-c2cc-11de-8d13-0010c6dffd0f',
        display: 'Parent/Child',
        category: ['family'],
      },
      {
        uuid: '8d91a3dc-c2cc-11de-8d13-0010c6dffd0f',
        display: 'Aunt/Uncle/Niece/Nephew',
        category: ['family'],
      },
      {
        uuid: '5f115f62-68b7-11e3-94ee-6bef9086de92',
        display: 'Guardian/Dependant',
        category: ['family'],
      },
      {
        uuid: 'd6895098-5d8d-11e3-94ee-b35a4132a5e3',
        display: 'Spouse/Spouse',
        category: ['sexual', 'family'],
      },
      {
        uuid: '007b765f-6725-4ae9-afee-9966302bace4',
        display: 'Partner/Partner',
        category: ['sexual', 'pns'],
      },
      {
        uuid: '2ac0d501-eadc-4624-b982-563c70035d46',
        display: 'Co-wife/Co-wife',
        category: ['family'],
      },
      {
        uuid: 'a8058424-5ddf-4ce2-a5ee-6e08d01b5960',
        display: 'Care-giver/Care-giver',
        category: ['family'],
      },
      {
        uuid: '3667e52f-8653-40e1-b227-a7278d474020',
        display: 'Primary caregiver/Primary caregiver',
        category: ['family'],
      },
      {
        uuid: '58da0d1e-9c89-42e9-9412-275cef1e0429',
        display: 'Injectable-drug-user/Injectable-druguser',
        category: ['pns'],
      },
      {
        uuid: '76edc1fe-c5ce-4608-b326-c8ecd1020a73',
        display: 'SNS/SNS',
        category: ['pns'],
      },
    ],
  },
  peerEducatorRelationship: {
    _type: Type.String,
    _description: 'Peer Educator Relationship type',
    _default: '96adecc2-e7cd-41d0-b577-08eb4834abcb',
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

  partography: {
    _type: Type.Object,
    _description: 'Partography module configuration',
    _default: {
      conceptMappings: {
        'fetal-heart-rate': ['1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
        'blood-pressure': ['5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
        'maternal-pulse': ['5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
        temperature: ['5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
        'cervical-dilation': ['162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
        'descent-of-head': ['1810AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
        'uterine-contractions': ['163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
        'urine-analysis': [
          '161442AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          '165438AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        ],
        'drugs-fluids': ['1282AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '161911AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
        'progress-events': [
          '162879AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          '1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          '163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        ],
      },
      stationDisplayMapping: {
        '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '0/5',
        '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '1/5',
        '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '2/5',
        '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '3/5',
        '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '4/5',
        '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '5/5',
      },
      stationValueMapping: {
        '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 0,
        '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 1,
        '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 2,
        '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 3,
        '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 4,
        '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 5,
      },
      encounterPatterns: [
        'mch-partograph',
        'partography',
        'fetal-monitoring',
        'maternal-monitoring',
        'obstetric-vitals',
        'labor-monitoring',
        'labour-monitoring',
      ],
      fallbackEncounterMapping: {
        'fetal-heart-rate': ['mch-mother-consultation', 'vitals', 'obstetric', 'maternal', 'consultation', 'clinical'],
        'cervical-dilation': ['mch-mother-consultation', 'obstetric', 'maternal', 'consultation', 'clinical'],
        'maternal-pulse': ['vitals', 'maternal', 'consultation', 'clinical'],
        'blood-pressure': ['vitals', 'maternal', 'consultation', 'clinical'],
        temperature: ['vitals', 'consultation', 'clinical'],
        'urine-analysis': ['vitals', 'laboratory', 'consultation', 'clinical'],
        'drugs-fluids': ['medication', 'treatment', 'consultation', 'clinical'],
        'progress-events': ['obstetric', 'maternal', 'consultation', 'clinical'],
      },
      defaultFallbackSequence: ['consultation', 'clinical'],
      retryFallbackTypes: ['vitals', 'consultation', 'clinical'],
      defaultEncounterProviderRole: 'a0b03050-c99b-11e0-9572-0800200c9a66',
      defaultLocationUuid: '1',
      storage: {
        maxLocalEntries: 100,
        storageKeyPrefix: 'partography_',
        cacheKeyPrefix: 'partography_encounters_',
      },
      timeConfig: {
        defaultEncounterOffset: 300000,
        retryEncounterOffset: 3600000,
        cacheInvalidationDelay: 1000,
      },
      progressEventConceptNames: {
        '1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': {
          name: 'Fetal Heart Rate',
          unit: 'BPM',
        },
        '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': {
          name: 'Cervical Dilation',
          unit: 'cm',
        },
        '163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': {
          name: 'Uterine Contractions',
          unit: 'per 10min',
        },
      },

      uuids: {
        timeSlot: 'a1b2c3d4-1111-2222-3333-444455556666',
        mchPartographyEncounterUuid: '022d62af-e2a5-4282-953b-52dd5cba3296',
        drugsFluidsEncounterUuid: '39da3525-afe4-45ff-8977-c53b7b359158',
        contractionStrongConceptUuid: '4b90b73a-ad11-4650-91b0-baea131974e0',
      },
      graphTypeDisplayNames: {
        'fetal-heart-rate': 'Fetal Heart Rate',
        'cervical-dilation': 'Cervical Dilation',
        'descent-of-head': 'Descent of Head',
        'uterine-contractions': 'Uterine Contractions',
        'maternal-pulse': 'Maternal Pulse',
        'blood-pressure': 'Blood Pressure',
        temperature: 'Temperature',
        'urine-analysis': 'Urine Analysis',
        'drugs-fluids': 'Drugs & Fluids',
        'progress-events': 'Progress & Events',
      },
      amnioticFluidMap: {
        'Membrane intact': '164899AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'Clear liquor': '159484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'Meconium Stained': '134488AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        Absent: '163747AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'Blood Stained': '1077AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      mouldingMap: {
        '0': '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '+': '1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '++': '1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '+++': '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      testData: {
        testGraphTypes: ['fetal-heart-rate', 'cervical-dilation', 'maternal-pulse', 'temperature', 'blood-pressure'],
        sampleDataPoints: [
          { value: 120, time: '10:00' },
          { value: 125, time: '11:00' },
          { value: 130, time: '12:00' },
          { value: 128, time: '13:00' },
        ],
        valueIncrement: 10,
        bloodPressureDecrement: 40,
      },
      descentOfHeadUuidToValue: {
        '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 0,
        '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 1,
        '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 2,
        '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 3,
        '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 4,
        '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 5,
      },
    },
  },

  caseManagerRelationshipType: {
    _type: Type.UUID,
    _description: 'Case manager/Client relationship type UUID',
    _default: '9065e3c6-b2f5-4f99-9cbf-f67fd9f82ec5',
  },
};

// Fetal Heart Rate Graph
export const FETAL_HEART_RATE_CONCEPT = '1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const FETAL_HEART_RATE_TIME_CONCEPT = 'bb3724c9-fbcc-49c5-9702-6cde0be325ca';
export const FETAL_HEART_RATE_HOUR_CONCEPT = '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

// Membrane Amniotic Fluid Graph
export const AMNIOTIC_FLUID_CONCEPT = '162653AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const RUPTURED_MEMBRANES_CONCEPT = '164900AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const AMNIOTIC_CLEAR_LIQUOR_CONCEPT = '159484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const AMNIOTIC_MECONIUM_STAINED_CONCEPT = '134488AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const AMNIOTIC_ABSENT_CONCEPT = '163747AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const AMNIOTIC_BLOOD_STAINED_CONCEPT = '1077AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const AMNIOTIC_MEMBRANE_INTACT_CONCEPT = 'd1787a76-7310-4223-a645-9fd410d418c1';

//Contractions Graph
export const UTERINE_CONTRACTIONS_CONCEPT = '163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const CONTRACTION_LEVEL_MILD_CONCEPT = '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const CONTRACTION_LEVEL_MODERATE_CONCEPT = '1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const CONTRACTION_LEVEL_STRONG_CONCEPT = '166788AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const UTERINE_CONTRACTION_FREQUENCY_CONCEPT = '166529AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const UTERINE_CONTRACTION_DURATION_CONCEPT = '159368AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

// Oxytocin Graph

export const OXYTOCIN_TIME_CONCEPT = 'bb3724c9-fbcc-49c5-9702-6cde0be325ca';
export const OXYTOCIN_DROPS_PER_MINUTE_CONCEPT = '1d109b10-7b30-4bfa-8a7c-6ecb73357fc2';
export const OXYTOCIN_DOSE_CONCEPT = '81369AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const ROUTE_CONCEPT = '8878f9c0-a1ce-47ec-a88f-69ef0f6576ba';
export const FREQUENCY_CONCEPT = 'fd9f82fd-f327-4502-ac8e-5d9144dbd504';

// Drugs IV Fluids Graph
export const MEDICATION_CONCEPT = 'c3082af8-f935-40c5-aa5b-74c684e81aea';
export const IV_FLUIDS_CONCEPT = '161911AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const DOSAGE_CONCEPT = 'b71ddb80-2d7f-4bde-a44b-236e62d4c1b6';
export const DRUG_DOSE_CONCEPT = '162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

// Pulse BP Graph
export const MATERNAL_PULSE_CONCEPT = '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const SYSTOLIC_BP_CONCEPT = '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const DIASTOLIC_BP_CONCEPT = '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const PULSE_BP_TIME_CONCEPT = 'bb3724c9-fbcc-49c5-9702-6cde0be325ca';

// Urine Test Graph
export const PROTEIN_LEVEL_CONCEPT = '161442AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const GLUCOSE_LEVEL_CONCEPT = '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const KETONE_LEVEL_CONCEPT = '165438AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const URINE_VOLUME_CONCEPT = '159660AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const URINE_CHARACTERISTICS_CONCEPT = '56AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const TIME_RESULTS_RETURNED = '67c3d4c6-465e-4c12-9b7f-d8587ca90603';
export const TIME_SAMPLE_COLLECTED = 'c554f157-2e16-4585-af29-c48f5e765ce0';

// Cervix / Cervical Monitoring During Labor
export const CERVIX_CONCEPT = '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const DESCENT_OF_HEAD_CONCEPT = '1810AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const STATION_0_CONCEPT = '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const STATION_1_CONCEPT = '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const STATION_2_CONCEPT = '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const STATION_3_CONCEPT = '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const STATION_4_CONCEPT = '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const STATION_5_CONCEPT = '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export const DRUG_ORDER_TYPE_UUID = '131168f4-15f5-102d-96e4-000c29c2a5d7';
export const ENCOUNTER_ROLE = '240b26f9-dd88-4172-823d-4a8bfeb7841f';
export const MOULDING_NONE_CONCEPT = '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const MOULDING_SLIGHT_CONCEPT = '1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const MOULDING_MODERATE_CONCEPT = '1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const MOULDING_SEVERE_CONCEPT = '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const TEMPERATURE_CONCEPT = '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const CONTRACTION_COUNT_CONCEPT = '159682AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const MEDICATION_NAME_CONCEPT = '164231AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const EVENT_TYPE_CONCEPT = '162879AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const EVENT_DESCRIPTION_CONCEPT = '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const MOULDING_CONCEPT = '166527AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const BLOOD_GROUP_CONCEPT = '300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const TIME_SLOT_CONCEPT = '163286AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const LABOR_PATTERN_CONCEPT = '164135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const HOURS_SINCE_RUPTURE_CONCEPT = '167149AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const DATE_OF_ADMISSION_CONCEPT = '1640AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const GESTATION_WEEKS_CONCEPT = '1789AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const ESTIMATED_DELIVERY_DATE_CONCEPT = '5596AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const LAST_MENSTRUAL_PERIOD_CONCEPT = '1427AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export interface ConfigObject {
  requireMaritalStatusOnAgeGreaterThanOrEqualTo: number;
  peerEducatorRelationship: string;
  morgueVisitTypeUuid: string;
  morgueDischargeEncounterUuid: string;
  caseManagementForms: Array<{ id: string; title: string; formUuid: string; encounterTypeUuid: string }>;
  peerCalendarOutreactForm: string;
  htsClientTracingConceptsUuids: {
    modeOfClienttracingConceptUuid: string;
    reasonNotContactedConceptUuid: string;
    tracingStatusConceptUuid: string;
    remarksConceptUuid: string;
  };
  encounterTypes: {
    mchMotherConsultation: string;
    hivTestingServices: string;
    kpPeerCalender: string;
    htsEcounterUuid: string;
    triage: string;
  };
  formsList: {
    labourAndDelivery: string;
    antenatal: string;
    postnatal: string;
    admissionRequestFormUuid: string;
    htsScreening: string;
    htsInitialTest: string;
    htsRetest: string;
    defaulterTracingFormUuid: string;
    clinicalEncounterFormUuid: string;
    peerCalendarOutreactForm: string;
    autopsyFormUuid: string;
    htsClientTracingFormUuid: string;
    complaintsFormUuid: string;
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
  relationshipTypesList: Array<{
    uuid: string;
    display: string;
    category: Array<'sexual' | 'pns' | 'family'>;
  }>;
  partography: {
    conceptMappings: Record<string, string[]>;
    stationDisplayMapping: Record<string, string>;
    stationValueMapping: Record<string, number>;
    encounterPatterns: string[];
    fallbackEncounterMapping: Record<string, string[]>;
    defaultFallbackSequence: string[];
    retryFallbackTypes: string[];
    defaultEncounterProviderRole: string;
    defaultLocationUuid: string;
    storage: {
      maxLocalEntries: number;
      storageKeyPrefix: string;
      cacheKeyPrefix: string;
    };
    timeConfig: {
      defaultEncounterOffset: number;
      retryEncounterOffset: number;
      cacheInvalidationDelay: number;
    };
    progressEventConceptNames: Record<string, { name: string; unit: string }>;
    graphTypeDisplayNames: Record<string, string>;
    testData: {
      testGraphTypes: string[];
      sampleDataPoints: Array<{ value: number; time: string }>;
      valueIncrement: number;
      bloodPressureDecrement: number;
    };
    uuids?: {
      timeSlot: string;
      mchPartographyEncounterUuid: string;
      drugsFluidsEncounterUuid: string;
      contractionStrongConceptUuid: string;
    };
  };
  caseManagerRelationshipType: string;
  complaintsConceptUuids: Array<string>;
  complaints: {
    chiefComplaintConceptUuid: string;
    complaintMemberConceptUuid: string;
    durationConceptUuid: string;
    onsetConceptUuid: string;
  };
}

export interface PartograpyComponents {
  id: string;
  date: string | Date;
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
