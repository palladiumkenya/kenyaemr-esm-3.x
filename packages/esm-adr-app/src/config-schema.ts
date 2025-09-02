import { Type } from '@openmrs/esm-framework';

export interface ADRConfigObject {
  adrAssessmentEncounterTypeUuid: string;
  adrAssessmentFormUuid: string;
}

export const configSchema = {
  adrAssessmentEncounterTypeUuid: {
    _type: Type.String,
    _description: 'UUID for ADR Assessment encounter type',
    _default: '7a185fe4-c56f-4195-b682-d3f5afa9d9c2 ',
  },
  adrAssessmentFormUuid: {
    _type: Type.String,
    _description: 'UUID for ADR Assessment form',
    _default: '461e1b45-b3f2-4899-b3e9-d3b110b6ed9c',
  },
};
