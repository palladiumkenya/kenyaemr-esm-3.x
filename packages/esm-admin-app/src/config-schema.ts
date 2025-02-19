import { fhirBaseUrl, Type } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

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

// Stock roles
export interface OpenmrsData extends OpenmrsObject {}
export interface OpenmrsObject {
  uuid?: string;
}
export type BaseOpenmrsObject = OpenmrsObject;
export interface BaseOpenmrsData extends BaseOpenmrsObject, OpenmrsData {}
export interface StockOperationType extends BaseOpenmrsData {
  uuid: string;
  name: string;
  description: string;
  operationType: string;
  hasSource: boolean;
  hasDestination: boolean;
  stockOperationTypeLocationScopes: Array<StockOperationTypeLocationScope>;
}

export interface StockOperationTypeLocationScope {
  uuid: string;
  locationTag: string;
  isSource: string;
  isDestination: string;
}

// Pagging
export interface PageableResult<ResultType> {
  results: ResultType[];
  totalCount: number | null;
}

export interface PagingCriteria {
  startIndex?: number | null;
  limit?: number | null;
}

// stock location

export interface FHIRResponse {
  entry: Array<{ resource: fhir.Location }>;
  total: number;
  type: string;
  resourceType: string;
}

export interface UserRoleScopeLocation extends BaseOpenmrsData {
  locationUuid?: string;
  locationName?: string;
  enableDescendants?: boolean;
}

export interface UserRoleScopeOperationType extends BaseOpenmrsData {
  operationTypeUuid?: string;
  operationTypeName?: string;
}

export interface UserRoleScope extends BaseOpenmrsData {
  userUuid?: string;
  role?: string;
  userName?: string;
  userGivenName?: string;
  userFamilyName?: string;
  permanent: boolean;
  activeFrom?: Date;
  activeTo?: Date;
  enabled: boolean;
  locations?: Array<UserRoleScopeLocation>;
  operationTypes?: Array<UserRoleScopeOperationType>;
}
