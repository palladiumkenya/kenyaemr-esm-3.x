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
