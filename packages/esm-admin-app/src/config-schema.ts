import { fhirBaseUrl, Type } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export const configSchema = {
  providerNationalIdUuid: {
    _type: Type.String,
    _description: 'UUID for provider national id',
    _default: '3d152c97-2293-4a2b-802e-e0f1009b7b15',
  },
  passportNumberUuid: {
    _type: Type.String,
    _description: 'UUID for passport number identification for provider',
    _default: '5b4b88e8-9db3-41e6-a175-5e39f2c8a9a5',
  },
  providerHieFhirReference: {
    _type: Type.String,
    _description: 'UUID for provider hie fhir reference',
    _default: '67b94e8e-4d61-4810-b0f1-d86497f6e553',
  },
  qualificationUuid: {
    _type: Type.String,
    _description: 'UUID for provider hie qualification',
    _default: '43f99413-6e7f-4812-bc60-066bb1d43f94',
  },
  licenseBodyUuid: {
    _type: Type.String,
    _description: 'UUID for license body',
    _default: 'ba18bb97-d17c-4640-80d2-58e7df90ca4c',
  },
  licenseNumberUuid: {
    _type: Type.String,
    _description: 'UUID for license number',
    _default: 'bcaaa67b-cc72-4662-90c2-e1e992ceda66',
  },
  licenseExpiryDateUuid: {
    _type: Type.String,
    _description: 'UUID for license expiry date',
    _default: '00539959-a1c7-4848-a5ed-8941e9d5e835',
  },
  phoneNumberUuid: {
    _type: Type.String,
    _description: 'UUID for provider phone number',
    _default: '37daed7f-1f4e-4e62-8e83-6048ade18a87',
  },
  providerAddressUuid: {
    _type: Type.String,
    _description: 'UUID for provider address',
    _default: '033ff604-ecf7-464f-b623-5b77c733667f',
  },
  personEmailAttributeUuid: {
    _type: Type.String,
    _description: 'UUID for person email attribute',
    _default: 'b8d0b331-1d2d-4a9a-b741-1816f498bdb6',
  },
  personPhonenumberAttributeUuid: {
    _type: Type.String,
    _description: 'UUID for person phone number attribute',
    _default: 'b2c38640-2603-4629-aebd-3b54f33f1e3a',
  },
  identifierTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.Object,
      properties: {
        key: { _type: Type.String },
        name: { _type: Type.String },
      },
    },
    _default: [
      { key: 'National ID', name: 'National ID' },
      { key: 'registration_number', name: 'Registration Number' },
      { key: 'Passport', name: 'Passport Number' },
    ],
    _description: 'List of identifier types with unique keys for each.',
  },
};

export interface UserProperties {
  loginAttempts: string;
  lastViewedPatientIds: string;
}

export interface ConfigObject {
  providerNationalIdUuid: string;
  passportNumberUuid: string;
  providerHieFhirReference: string;
  phoneNumberUuid: string;
  providerAddressUuid: string;
  qualificationUuid: string;
  licenseBodyUuid: string;
  licenseNumberUuid: string;
  personEmailAttributeUuid: string;
  personPhonenumberAttributeUuid: string;
  licenseExpiryDateUuid: string;
  identifierTypes: Array<{
    key: string;
    name: string;
  }>;
}
