import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  nationalPatientUniqueIdentifier: {
    _type: Type.UUID,
    _description: 'The national patient unique identifier',
    _default: 'f85081e2-b4be-4e48-b3a4-7994b69bb101',
  },
  phoneNumberAttributeType: {
    _type: Type.UUID,
    _description: 'The patient phone number attribute type uuid',
    _default: 'b2c38640-2603-4629-aebd-3b54f33f1e3a',
  },
  socialHealthAuthorityIdentifierType: {
    _type: Type.UUID,
    _description: 'Social Health Authority Unique Identification Number',
    _default: '24aedd37-b5be-4e08-8311-3721b8d5100d',
  },
};

export type ReferralConfigObject = {
  nationalPatientUniqueIdentifier: string;
  phoneNumberAttributeType: string;
  socialHealthAuthorityIdentifierType: string;
};
