import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  nationalIDUuid: {
    _type: Type.String,
    _description: ' UUID for national identification',
    _default: 'b2c38640-2603-4629-aebd-3b54f33f1e3a',
  },
  passportNumberUuid: {
    _type: Type.String,
    _description: ' UUID for national identification',
    _default: '3ca03c84-632d-4e53-95ad-91f1bd9d96d6',
  },
};

export interface ConfigObject {
  nationalIDUuid: string;
  passportNumberUuid: string;
}
