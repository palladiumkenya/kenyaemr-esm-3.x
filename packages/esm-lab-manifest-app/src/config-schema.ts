import { Type, validator } from '@openmrs/esm-framework';

export const configSchema = {
  labmanifestTypes: {
    _type: Type.Array,
    _description: 'List of Lab manifest types',
    _default: [
      {
        id: 1,
        type: 'EID',
      },
      {
        id: 2,
        type: 'VL',
      },
      {
        id: 3,
        type: 'Influenza',
      },
    ],
  },
  sampleTypes: {
    _type: Type.Array,
    _description: 'List of sample types and list of manifest type id it applies',
    _default: [
      { sampleType: 'Frozen plasma', labManifestType: ['2'] },
      { sampleType: 'Whole Blood', labManifestType: ['2'] },
      { sampleType: 'DBS', labManifestType: ['1'] },
      { sampleType: 'Nasal Swab', labManifestType: ['3'] },
      { sampleType: 'NP', labManifestType: ['3'] },
      { sampleType: 'OP', labManifestType: ['3'] },
    ],
  },
  patientIdentifierTypes: {
    _type: Type.Object,
    _description: 'Patient identifier type uuids',
    _default: {
      cccNumberIdentifierType: '05ee9cf4-7242-4a17-b4d4-00f707265c8a',
      kdodIdentifierType: 'b51ffe55-3e76-44f8-89a2-14f5eaf11079',
    },
  },
};
export interface LabManifestConfig {
  labmanifestTypes: Array<{ id: number; type: string }>;
  sampleTypes: Array<{ sampleType: string; labManifestType: Array<string> }>;
  patientIdentifierTypes: {
    cccNumberIdentifierType: string;
    kdodIdentifierType: string;
  };
}
