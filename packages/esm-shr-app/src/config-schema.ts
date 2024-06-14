import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  nationalPatientUniqueIdentifier: {
    _type: Type.UUID,
    _description: 'The national patient unique identifier',
    _default: 'f85081e2-b4be-4e48-b3a4-7994b69bb101',
  },
};

export type ReferralConfigObject = {
  nationalPatientUniqueIdentifier: string;
};
