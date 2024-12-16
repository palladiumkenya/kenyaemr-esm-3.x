export interface ETLResponse {
  script_name: string;
  start_time: string;
  stop_time: string;
  status: string;
}

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
}

export interface User {
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
  };
  privileges: Array<string>;
  roles: Array<{
    uuid: string;
    display: string;
  }>;
  retired: boolean;
  resourceVersion: string;
}

export interface Roles {
  uuid: string;
  display: string;
  name: string;
  description: string;
  retired: boolean;
  privileges: Array<string>;
  inheritedRoles: Array<string>;
}

export interface UserSchema {
  uuid: string;
  display: string;
  username: string;
  password?: string;
  systemId: string;
  userProperties?: {
    loginAttempts: string;
    lastViewedPatientIds: string;
  };
  person: {
    names: Array<{
      givenName: string;
      familyName: string;
      middleName: string;
    }>;
    gender: string;
    birthdate?: string;
    attributes: Array<{
      attributeType?: string;
      value: string;
    }>;
  };
  roles: Array<{
    name: string;
    description: string;
  }>;
  privileges?: Array<string>;
  retired?: boolean;
  links?: Array<{
    rel: string;
    uri: string;
  }>;
  resourceVersion?: string;
}

export interface UserRoleSchema {
  name: string;
  description: string;
  category: string;
}
