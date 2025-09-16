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
};

export type ExpressWorkflowConfig = {
  identifierTypes: Array<{ identifierType: string; identifierValue: string }>;
  supersetDashboardConfig: {
    host: string;
    dashboardId: string;
  };
  labOrderTypeUuid: string;
  orderableConceptSets: Array<string>;
  imagingOrderTypeUuid: string;
  imagingOrderableConceptSets: Array<string>;
};
