import { Type } from '@openmrs/esm-framework';
import _default from 'react-hook-form/dist/logic/appendErrors';

export const configSchema = {
  nationalIDUuid: {
    _type: Type.String,
    _description: 'UUID for national identification',
    _default: '49af6cdc-7968-4abb-bf46-de10d7f4859f',
  },
  passportNumberUuid: {
    _type: Type.String,
    _description: 'UUID for passport number identification for provider',
    _default: 'b2a8819f-13ae-46b1-b730-f42193724dbc',
  },
  licenseExpiryDateUuid: {
    _type: Type.String,
    _description: 'UUID for license expiry date',
    _default: '00539959-a1c7-4848-a5ed-8941e9d5e835',
  },
  licenseBodyUuid: {
    _type: Type.String,
    _description: 'UUID for license body',
    _default: 'ba18bb97-d17c-4640-80d2-58e7df90ca4c',
  },
  providerNationalIdUuid: {
    _type: Type.String,
    _description: 'UUID for provider national id',
    _default: '3d152c97-2293-4a2b-802e-e0f1009b7b15',
  },
  licenseNumberUuid: {
    _type: Type.String,
    _description: 'UUID for provider licensing body',
    _default: 'bcaaa67b-cc72-4662-90c2-e1e992ceda66',
  },
  providerHieFhirReference: {
    _type: Type.String,
    _description: 'UUID for provider hie fhir reference',
    _default: '67b94e8e-4d61-4810-b0f1-d86497f6e553',
  },
  phoneNumberUuid: {
    _type: Type.String,
    _description: 'UUID for provider hie phone number',
    _default: '37daed7f-1f4e-4e62-8e83-6048ade18a87',
  },
  qualificationUuid: {
    _type: Type.String,
    _description: 'UUID for provider hie qualification',
    _default: '43f99413-6e7f-4812-bc60-066bb1d43f94',
  },
  providerAddressUuid: {
    _type: Type.String,
    _description: 'UUID for provider hie address',
    _default: '033ff604-ecf7-464f-b623-5b77c733667f',
  },
  defaultPrimaryFacility: {
    _type: Type.String,
    _description: 'Default facility for a provider',
    _default: '5a53dddd-b382-4245-9bf1-03bce973f24b',
  },
  defaultTelephonePhone: {
    _type: Type.String,
    _description: 'Default Telephone number for a provider',
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

export interface ConfigObject {
  nationalIDUuid: string;
  passportNumberUuid: string;
  licenseExpiryDateUuid: string;
  providerHieFhirReference: string;
  phoneNumberUuid: string;
  qualificationUuid: string;
  providerAddressUuid: string;
  licenseBodyUuid: string;
  providerNationalIdUuid: string;
  licenseNumberUuid: string;
  defaultPrimaryFacility: string;
  defaultTelephonePhone: string;
  identifierTypes: Array<{
    key: string;
    name: string;
  }>;
}
