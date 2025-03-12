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
    _default: 'b2a8819f-13ae-46b1-b730-f42193724dbc',
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
  qualificationUuid: string;
  licenseBodyUuid: string;
  identifierTypes: Array<{
    key: string;
    name: string;
  }>;
}
