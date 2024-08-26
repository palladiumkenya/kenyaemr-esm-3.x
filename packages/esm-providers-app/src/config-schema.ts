import { Type } from '@openmrs/esm-framework';
import _default from 'react-hook-form/dist/logic/appendErrors';

export const configSchema = {
  nationalIDUuid: {
    _type: Type.String,
    _description: ' UUID for national identification',
    _default: '49af6cdc-7968-4abb-bf46-de10d7f4859f',
  },
  passportNumberUuid: {
    _type: Type.String,
    _description: ' UUID for national identification',
    _default: 'be9beef6-aacc-4e1f-ac4e-5babeaa1e303',
  },
  licenseExpiryDateUuid: {
    _type: Type.String,
    _description: 'UUID for license expiry date',
    _default: '00539959-a1c7-4848-a5ed-8941e9d5e835',
  },
  licenseBodyUuid: {
    _type: Type.String,
    _description: 'UUID for license body',
    _defualt: 'ba18bb97-d17c-4640-80d2-58e7df90ca4c',
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
  defaultprimaryFacility: {
    _type: Type.String,
    _description: 'Default facility for a provider',
    _default: '5a53dddd-b382-4245-9bf1-03bce973f24b',
  },
  defualtTelephonePhone: {
    _type: Type.String,
    _description: 'Default Telephone number for a provider',
    _default: 'b2c38640-2603-4629-aebd-3b54f33f1e3a',
  },
};

export interface ConfigObject {
  nationalIDUuid: string;
  passportNumberUuid: string;
  licenseExpiryDateUuid: string;
  licenseBodyUuid: string;
  providerNationalIdUuid: string;
  licenseNumberUuid: string;
  defaultprimaryFacility: string;
}
