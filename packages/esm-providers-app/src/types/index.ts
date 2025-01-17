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
  birthdate: string;
  attributes: PersonAttribute[];
}

export interface UserRoles {
  uuid: string;
  display: string;
}
export interface Practitioner {
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
