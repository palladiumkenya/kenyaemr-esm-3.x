import { Type } from '@openmrs/esm-framework';

export const configSchema = {};

export interface ConfigObject {}

export interface UserConfig {
  users: Array<{
    uuid: string;
    display: string;
    username: string;
    systemId: string;
    userProperties: {
      loginAttempts: string;
      lastViewedPatientIds: string;
    };
    person: {
      uuid: string;
      display: string;
      links: Array<{
        rel: string;
        uri: string;
      }>;
    };
    privileges: Array<string>;
    roles: Array<{
      uuid: string;
      display: string;
      links: Array<{
        rel: string;
        uri: string;
      }>;
    }>;
    retired: boolean;
    links: Array<{
      rel: string;
      uri: string;
    }>;
    resourceVersion: string;
  }>;
}
