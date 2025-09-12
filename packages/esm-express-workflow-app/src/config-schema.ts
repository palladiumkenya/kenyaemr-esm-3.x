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
        'programs-summary-dashboard',
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
};

export type ExpressWorkflowConfig = {
  identifierTypes: Array<{ identifierType: string; identifierValue: string }>;
  supersetDashboardConfig: {
    host: string;
    dashboardId: string;
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
};
