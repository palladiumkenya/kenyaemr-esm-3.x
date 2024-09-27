export interface CauseOfDeathFetchResponse {
  uuid: string;
  value: string;
}

export interface ConceptAnswer {
  display: string;
  name: string;
  uuid: string;
}

export interface ConceptAnswersResponse {
  answers?: Array<ConceptAnswer>;
}

export interface DeceasedInfo {
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
export interface DeceasedPatientResponse {
  results: DeceasedInfo[];
}
