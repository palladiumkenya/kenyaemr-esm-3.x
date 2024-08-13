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
};
export interface LabManifestConfig {
  labmanifestTypes: Array<{ id: number; type: string }>;
}
