import { Type } from '@openmrs/esm-framework';

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
};

export interface ConfigObject {
  nationalIDUuid: string;
  passportNumberUuid: string;
}
