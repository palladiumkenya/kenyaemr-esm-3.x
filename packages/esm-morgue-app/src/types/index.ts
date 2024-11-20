export interface Patient {
  uuid: string;
  display: string;
  identifiers: Array<{
    identifier: string;
    uuid: string;
    preferred: boolean;
    location: {
      uuid: string;
      name: string;
    };
  }>;
  person: {
    uuid: string;
    display: string;
    gender: string;
    birthdate: string;
    dead: boolean;
    age: number;
    deathDate: string | null;
    causeOfDeath: {
      uuid: string;
      display: string;
    } | null;
    preferredAddress: {
      uuid: string;
      stateProvince: string | null;
      countyDistrict: string | null;
      address4: string | null;
    } | null;
  };
}
// export interface DeceasedPatientResponse {
//   results: Patient[];
// }

export interface DeceasedInfo {
  uuid: string;
  status?: string;
  display: string;
  identifiers: Array<{
    identifier: string;
    uuid: string;
    preferred: boolean;
    location: {
      uuid: string;
      name: string;
    };
  }>;
  person: {
    uuid: string;
    display: string;
    gender: string;
    birthdate: string;
    dead: boolean;
    age: number;
    deathDate: string | null;
    causeOfDeath: {
      uuid: string;
      display: string;
    } | null;
    preferredAddress: {
      uuid: string;
      stateProvince: string | null;
      countyDistrict: string | null;
      address4: string | null;
    } | null;
  };
}
export interface DeceasedPatientResponse {
  results: DeceasedInfo[];
}

export interface VisitTypeResponse {
  uuid: string;
  display: string;
  name: string;
}

interface AttributeType {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  attributeOrder: number;
  format: string;
  foreignKey: string | null;
  regExp: string | null;
  required: boolean;
}

export interface Creator {
  uuid: string;
  display: string;
  links: Link[];
}
export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}
export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: null;
  dateChanged: null;
}
export interface PaymentMethod {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  retireReason: null;
  auditInfo: AuditInfo;
  attributeTypes: AttributeType[];
  sortOrder: null;
  resourceVersion: string;
}

export interface Location {
  name: string;
  uuid: string;
  display: string;
}

export interface Visit {
  uuid: string;
  display?: string;
  encounters: EncounterList[];
  patient?: {
    uuid: string;
    display: string;
    person: {
      uuid: string;
      display: string;
      gender: string;
      birthdate: string;
      dead: boolean;
      age: number;
      deathDate: string;
      causeOfDeath: {
        uuid: string;
        display: string;
      };
    };
  };
  visitType: VisitType;
  location?: Location;
  startDatetime: string;
  stopDatetime?: string;
}

export interface VisitType {
  uuid: string;
  display: string;
  name?: string;
}

export interface EncounterList {
  uuid: string;
  display: string;
  encounterDatetime: string;
  patient: {
    uuid: string;
    display: string;
    person: {
      uuid: string;
      display: string;
      gender: string;
      birthdate: string;
      dead: boolean;
      age: number;
      deathDate: string;
      causeOfDeath: {
        uuid: string;
        display: string;
      };
    };
  };
  form: string;
  encounterType: {
    uuid: string;
    display: string;
    name: string;
  };
}
