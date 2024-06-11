export interface UuidDisplay {
  uuid: string;
  display: string;
}

export interface Encounter {
  uuid: string;
  display: string;
  encounterDatetime: string;
  patient: Patient;
  location: Location;
  form: Form;
  encounterType: EncounterType;
  obs: Ob[];
  orders: Order[];
  voided: boolean;
  visit: Visit;
  encounterProviders: EncounterProvider[];
  diagnoses: any[];
  links: Link[];
  resourceVersion: string;
}

export interface Patient {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Location {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Form {
  uuid: string;
  display: string;
  links: Link[];
}

export interface EncounterType {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Ob {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Order {
  uuid: string;
  display: string;
  links: Link[];
  type: string;
}

export interface Visit {
  uuid: string;
  display: string;
  links: Link[];
}

export interface EncounterProvider {
  uuid: string;
  display: string;
  links: Link[];
}
