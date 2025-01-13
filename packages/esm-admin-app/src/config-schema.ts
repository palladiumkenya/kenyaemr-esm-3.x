import { Type } from '@openmrs/esm-framework';

export const configSchema = {};

export interface ConfigObject {}

export interface UserProperties {
  loginAttempts: string;
  lastViewedPatientIds: string;
}

export interface Person {
  uuid?: string;
  display?: string;
  gender: string;
  names?: Array<Name>;
  attributes?: Array<Attribute>;
}

export interface Role {
  uuid: string;
  description?: string;
  display?: string;
  name?: string;
}

export interface User {
  uuid: string;
  display: string;
  username: string;
  password?: string;
  systemId: string;
  userProperties: UserProperties;
  person: Person;
  privileges?: Array<string>;
  roles: Array<Role>;
  retired: boolean;
  resourceVersion: string;
}

export interface Name {
  givenName: string;
  familyName: string;
  middleName: string;
}

export interface Attribute {
  attributeType?: string;
  value?: string;
}

export interface UserProperties {
  loginAttempts: string;
  lastViewedPatientIds: string;
}

export interface UserRoleSchema {
  name: string;
  description: string;
  category: string;
}

export interface Provider {
  uuid?: string;
  identifier?: string;
  retired: boolean;
  attributes?: Array<Attribute>;
}

export interface ProviderAttributes {
  uuid?: string;
  identifier?: string;
  retired: boolean;
  attributes?: Array<AttributeItems>;
}

export interface AttributeItems {
  attributeType?: AttributeType;
  value?: any;
}

export interface AttributeType {
  uuid?: string;
  description?: string;
  display?: string;
  name?: string;
}

export interface AttributeValue {
  name?: string;
  uuid?: string;
}

export interface ProviderLocation {
  uuid: string;
  name?: string;
  description?: string;
  retired: boolean;
  attributes?: Array<AttributeItems>;
}
