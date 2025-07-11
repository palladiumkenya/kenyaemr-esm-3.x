export interface MortuaryPatient {
  patient: Patient;
}

export interface Patient {
  uuid: string;
  display: string;
  identifiers: Identifier[];
  person: Person;
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
}
