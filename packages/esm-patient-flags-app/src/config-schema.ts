import { ConfigSchema, Type } from '@openmrs/esm-framework';

export const configSchema: ConfigSchema = {
  excludeLinks: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
      _description: 'Label for the link to hide',
    },
    _default: [],
    _description: 'Array of links to hide in the patient flags app',
  },
};

export type ConfigObject = {
  excludeLinks: Array<string>;
};
