import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  identifierTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.Object,
      properties: { identifierType: { _type: Type.String }, identifierValue: { _type: Type.String } },
    },
    _default: [
      { identifierType: 'Select an identifier type', identifierValue: 'select-identifier-type' },
      { identifierType: 'National ID', identifierValue: 'National ID' },
      { identifierType: 'Passport Number', identifierValue: 'passport-number' },
      { identifierType: 'Birth Certificate Number', identifierValue: 'birth-certificate-number' },
      { identifierType: 'Alien ID Number', identifierValue: 'alien-id-number' },
      { identifierType: 'Refugee ID Number', identifierValue: 'refugee-number' },
    ],
    _description: 'List of identifier types with unique keys for each.',
  },
  supersetDashboardConfig: {
    _type: Type.Object,
    _description: 'Superset embeded dashboards config',
    _default: {
      host: 'http://34.35.62.41:8080',
      dashboardId: 'bd7102f9-9291-4a11-9b98-8a17d9142cac',
    },
  },
  concepts: {
    defaultPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default priority for the queues eg Not urgent.',
      _default: '80cd8f8c-5d82-4cdc-b96e-a6addeb94b7f',
    },
    defaultStatusConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default status for the queues eg Waiting.',
      _default: '167407AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    emergencyPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the priority with the highest sort weight for the queues eg Emergency.',
      _default: '037446f4-adfc-40b3-928c-a39a4826b1bf',
    },
  },
  visitQueueNumberAttributeUuid: {
    _type: Type.String,
    _description: 'The UUID of the visit attribute that contains the visit queue number.',
    _default: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
  },
  patientChartConfig: {
    _type: Type.Object,
    _description: 'Patient chart Tabs config',
    _default: {
      femaleOnlyExtensions: ['charts-partography-dashboard'],
      excludeFromMainChart: ['charts-partography-dashboard'],
      includeInMchChart: [
        'charts-partography-dashboard',
        'charts-summary-dashboard',
        'care-panel-summary-dashboard-link',
        'patient-orders-summary-dashboard',
        'test-results-summary-dashboard',
        'attachments-results-summary-dashboard',
        'charts-mch-program-management-dashboard',
      ],
      excludeExtensions: [],
    },
  },
  queueServiceConceptUuids: {
    _type: Type.Object,
    _description: 'Concept UUIDs for queue service',
    _default: {
      triageService: '167411AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      consultationService: '167410AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  queuStatusConceptUuids: {
    _type: Type.Object,
    _description: 'Concept UUIDs for queue status',
    _default: {
      waitingStatus: '167407AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      inServiceStatus: '167408AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      finishedStatus: '167409AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  labOrderTypeUuid: {
    _type: Type.String,
    _description: 'UUID for lab order type',
    _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
  },
  imagingOrderTypeUuid: {
    _type: Type.String,
    _description: 'UUID for imaging order type',
    _default: 'b4a7c280-369e-4d12-9ce8-18e36783fed6',
  },
  imagingConceptClassUuid: {
    _type: Type.String,
    _description: 'Concept class UUID for imaging orders',
    _default: '8caa332c-efe4-4025-8b18-3398328e1323',
  },
  orderableConceptSets: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _default: ['9a6f10d6-7fc5-4fb7-9428-24ef7b8d01f7'],
    _description: 'UUIDs for orderable concept sets',
  },
  imagingOrderableConceptSets: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _default: ['164068AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
    _description: 'UUIDs for imaging orderable concept sets',
  },
  clinicalEncounter: {
    _type: Type.Object,
    _description: 'Clinical encounter type UUID and form UUID',
    _default: {
      encounterTypeUuid: '465a92f2-baf8-42e9-9612-53064be868e8',
      formUuid: 'e958f902-64df-4819-afd4-7fb061f59308',
    },
  },
};

export type ExpressWorkflowConfig = {
  identifierTypes: Array<{ identifierType: string; identifierValue: string }>;
  supersetDashboardConfig: {
    host: string;
    dashboardId: string;
  };
  visitQueueNumberAttributeUuid: string;
  concepts: {
    defaultPriorityConceptUuid: string;
    defaultStatusConceptUuid: string;
    emergencyPriorityConceptUuid: string;
  };
  patientChartConfig: {
    femaleOnlyExtensions: Array<string>;
    excludeFromMainChart: Array<string>;
    includeInMchChart: Array<string>;
    excludeExtensions: Array<string>;
  };
  queueServiceConceptUuids: {
    triageService: string;
    consultationService: string;
  };
  queuStatusConceptUuids: {
    waitingStatus: string;
    inServiceStatus: string;
    finishedStatus: string;
  };
  labOrderTypeUuid: string;
  imagingConceptClassUuid: string;
  orderableConceptSets: Array<string>;
  imagingOrderTypeUuid: string;
  imagingOrderableConceptSets: Array<string>;
  clinicalEncounter: {
    encounterTypeUuid: string;
    formUuid: string;
  };
};
