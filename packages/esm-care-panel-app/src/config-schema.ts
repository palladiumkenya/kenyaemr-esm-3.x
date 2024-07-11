import { Type } from '@openmrs/esm-framework';

export interface CarePanelConfig {
  regimenObs: {
    encounterProviderRoleUuid: string;
  };
  hivProgramUuid: string;
}

export const configSchema = {
  regimenObs: {
    encounterProviderRoleUuid: {
      _type: Type.UUID,
      _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
      _description: "The provider role to use for the regimen encounter. Default is 'Unkown'.",
    },
  },
  hivProgramUuid: {
    _type: Type.String,
    _description: 'HIV Program UUID',
    _default: 'dfdc6d40-2f2f-463d-ba90-cc97350441a8',
  },
};
