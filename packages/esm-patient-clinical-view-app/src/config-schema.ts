import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  identifiers: {
    _type: Type.Object,
    _description: 'Identifier sources',
    _default: {
      preferredIdentifierSource: 'dfacd928-0370-4315-99d7-6ec1c9f7ae76',
    },
  },
  encounterTypes: {
    _type: Type.Object,
    _description: 'List of MCH encounter type UUIDs',
    _default: {
      mchMotherConsultation: 'c6d09e05-1f25-4164-8860-9f32c5a02df0',
    },
  },
  formsList: {
    _type: Type.Object,
    _description: 'List of MCH-mother form UUIDs',
    _default: {
      antenatal: 'e8f98494-af35-4bb8-9fc7-c409c8fed843',
      postNatal: '72aa78e0-ee4b-47c3-9073-26f3b9ecc4a7',
      labourAndDelivery: '496c7cc3-0eea-4e84-a04c-2292949e2f7f',
    },
  },
};

export interface ConfigObject {
  identifiers: Object;
  encounterTypes: Object;
  formsList: Object;
}
