import { fhirBaseUrl, Type } from '@openmrs/esm-framework';

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
export interface FrontendModule {
  name: string;
  version?: string;
}
export interface SHAFacility {
  operationalStatus: string;
  approved: string;
  kephLevel: string;
  shaFacilityId: string;
  shaFacilityExpiryDate: string;
  registrationNumber: string;
  mflCode: string;
  shaFacilityLicenseNumber: string;
  facilityRegistryCode: string;
  source: string;
}

export interface DefaultFacility {
  locationId: number;
  uuid: string;
  display: string;
}

export interface PractitionerResponse {
  id: string;
  link: Link[];
  meta: Metadata;
  entry: Entry[];
}

interface Metadata {
  lastUpdated: string;
}
interface Link {
  relation: string;
  url: string;
}
interface Entry {
  resource: {
    id: string;
    identifier: IdentifierType[];
    active: boolean;
    name: Name[];
    telecom: ContactList[];
    extension: Extension[];
    gender: string;
    qualification: Qualification[];
  };
}
export interface Extension {
  url: string;
  valueCodeableConcept: ValueCodeableConcept;
}

export interface ValueCodeableConcept {
  coding: Coding[];
}

export interface Coding {
  system: string;
  code: string;
  display: string;
}

interface IdentifierType {
  type: {
    coding: {
      code: string;
      display: string;
      system?: string;
    }[];
  };
  value: string;
  period?: {
    start?: string;
    end?: string;
  };
}

interface ContactList {
  system: string;
  value?: string;
}

interface Name {
  text: string;
}

interface Qualification {
  extension: QualificationExtension[];
  code: {
    coding: {
      system?: string;
      code?: string;
      display: string;
    }[];
  };
  period: {
    start: string;
    end: string;
  };
}

interface QualificationExtension {
  url: string;
  valueCoding?: {
    system?: string;
    code?: string;
    display?: string;
  };
  valueString?: string;
  valueCodeableConcept?: {
    coding: {
      system: string;
      code: string;
      display: string;
    }[];
  };
}
export interface Person {
  uuid?: string;
  display?: string;
  gender: string;
  names?: Array<PersonName>;
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

export interface PersonName {
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

export interface ProviderResponse {
  uuid: string;
  display: string;
  person: PersonResponse;
  identifier: string;
  attributes: Array<{
    uuid: string;
    display: string;
    attributeType: {
      uuid: string;
      display: string;
    };
    value: string;
  }>;
  retired: boolean;
  voided: boolean;
}
interface PersonResponse {
  uuid: string;
  display: string;
  names: {
    givenName: string;
    familyName: string;
  };
  gender: string;
  birthdate: string;
  attributes: Array<{
    uuid: string;
    display: string;
  }>;
}
export interface UserResponse {
  uuid: string;
  display: string;
  username: string;
  systemId: string;
  person: PersonResponse;
  roles: Array<{
    uuid: string;
    display: string;
    description: string;
  }>;
}
