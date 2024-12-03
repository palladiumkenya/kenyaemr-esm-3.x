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
        type: 'FLU',
      },
    ],
  },
  sampleTypes: {
    _type: Type.Array,
    _description: 'List of sample types and list of manifest type id it applies',
    _default: [
      { sampleType: 'Frozen plasma', labManifestType: ['2', '3'] },
      { sampleType: 'Whole Blood', labManifestType: ['2', '3'] },
      { sampleType: 'DBS', labManifestType: ['1'] },
    ],
  },
};
export interface LabManifestConfig {
  labmanifestTypes: Array<{ id: number; type: string }>;
  sampleTypes: Array<{ sampleType: string; labManifestType: Array<string> }>;
}
