export interface MortuaryPatient {
  patient: Patient;
  person: Person2;
  personName: PersonName;
  resourceVersion: string;
}

export interface Patient {
  uuid: string;
  display: string;
  identifiers: Identifier[];
  person: Person;
  voided: boolean;
  links: Link7[];
  resourceVersion: string;
}

export interface Identifier {
  uuid: string;
  display: string;
}
export interface Person {
  uuid: string;
  display: string;
  gender: string;
  age: number;
  birthdate: string;
  birthdateEstimated: boolean;
  dead: boolean;
  deathDate: string;
  causeOfDeath: CauseOfDeath;
  preferredAddress: PreferredAddress;
  attributes: Attribute[];
  voided: boolean;
  birthtime: any;
  deathdateEstimated: boolean;
}

export interface CauseOfDeath {
  uuid: string;
  display: string;
}

export interface PreferredAddress {
  uuid: string;
  display: any;
}
export interface Attribute {
  uuid: string;
  display: string;
  links: Link5[];
}

export interface Link5 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link6 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link7 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Person2 {
  uuid: string;
  display: string;
  identifiers: Identifier2[];
  person: Person3;
  voided: boolean;
  links: Link14[];
  resourceVersion: string;
}

export interface Identifier2 {
  uuid: string;
  display: string;
  links: Link8[];
}

export interface Link8 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Person3 {
  uuid: string;
  display: string;
  gender: string;
  age: number;
  birthdate: string;
  birthdateEstimated: boolean;
  dead: boolean;
  deathDate: string;
  causeOfDeath: CauseOfDeath2;
  preferredName: PreferredName2;
  preferredAddress: PreferredAddress2;
  attributes: Attribute2[];
  voided: boolean;
  birthtime: any;
  deathdateEstimated: boolean;
  links: Link13[];
  resourceVersion: string;
}

export interface CauseOfDeath2 {
  uuid: string;
  display: string;
  links: Link9[];
}

export interface Link9 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface PreferredName2 {
  uuid: string;
  display: string;
  links: Link10[];
}

export interface Link10 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface PreferredAddress2 {
  uuid: string;
  display: any;
  links: Link11[];
}

export interface Link11 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Attribute2 {
  uuid: string;
  display: string;
  links: Link12[];
}

export interface Link12 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link13 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link14 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface PersonName {
  display: string;
  uuid: string;
  givenName: string;
  middleName: string;
  familyName: string;
  familyName2: any;
  voided: boolean;
  links: Link15[];
  resourceVersion: string;
}

export interface Link15 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Bed {
  id: number;
  uuid: string;
  bedNumber: string;
  bedType?: BedType;
  row: number;
  column: number;
  status: 'AVAILABLE' | 'OCCUPIED';
}
export interface BedType {
  uuid: string;
  name: string;
  displayName: string;
  description: string;
}
export type MappedBedData = Array<{
  id: number;
  number: string;
  type: string;
  status: string;
  uuid: string;
}>;
