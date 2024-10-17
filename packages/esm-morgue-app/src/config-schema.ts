import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  autopsyEncounterUuid: {
    _type: Type.String,
    _description: 'Encounter UUID for autopsy',
    _default: '',
  },
  formsList: {
    _type: Type.Object,
    _description: 'List of form UUIDs',
    _default: {
      autopsyFormUuid: '',
    },
  },
};

export type ConfigObject = {
  formsList: {
    autopsyFormUuid: string;
  };
  autopsyEncounterUuid: string;
};
