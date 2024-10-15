import { OpenmrsResource } from '@openmrs/esm-framework';
import { Value } from 'classnames';

export interface Roles {
  uuid: string;
  display: string;
  privileges: {
    uuid: string;
    description: string;
  };
}

export interface RolesResponse {
  results: Roles[];
}

export interface Facility {
  uuid: string;
  name: string;
  attributes: [
    {
      value: string;
    },
  ];
}

export interface FacilityResponse {
  results: Facility[];
}

export interface ProviderResponse {
  uuid: string;
  display: string;
  person: Person;
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

interface PersonAttribute {
  uuid: string;
  display: string;
}

interface Person {
  uuid: string;
  display: string;
  names: {
    givenName: string;
    familyName: string;
  };
  gender: string;
  attributes: PersonAttribute[];
}

export interface UserRoles {
  uuid: string;
  display: string;
}
export interface Practitioner {
  id: string;
  meta: Metadata;
  extension: ExtensionCadre[];
  identifier: IdentifierType[];
  active: boolean;
  name: PractitionerName[];
  telecom: ContactList[];
  qualification: Qualification[];
}

interface Metadata {
  lastUpdated: string;
  profile: string[];
}

interface ExtensionCadre {
  url: string;
  valueCoding?: {
    system?: string;
    code?: string;
    display?: string;
  };
  valueString?: string;
}

interface IdentifierType {
  use: string;
  type: {
    coding: {
      code: string;
    }[];
  };
  value: string;
}

interface PractitionerName {
  family: string;
  given: string[];
  prefix: string[];
}

interface ContactList {
  system: string;
  use: string;
  value?: string;
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
}

interface QualificationExtension {
  url: string;
  valueCoding?: {
    system?: string;
    code?: string;
    display?: string;
  };
  valueString?: string;
}

export interface User {
  uuid: string;
  person: Person;
  username: string;
  allRoles: Array<UserRoles>;
  retired: boolean;
}
export type ProviderSession = {
  authenticated: boolean;
  user?: string;
  currentProvider?: string[];
  sessionLocation?: string;
};
export type Provider = {
  id?: string;
  uuid?: string;
  identifier?: string;
  display: string;
  person: OpenmrsResource;
  attributes?: Array<OpenmrsResource> | null;
  retired: boolean;
};
