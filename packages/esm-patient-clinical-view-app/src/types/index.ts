import { OpenmrsResource } from '@openmrs/esm-framework';
export interface OpenmrsEncounter extends OpenmrsResource {
  encounterDatetime: string;
  encounterType: string;
  patient: string;
  location: string;
  encounterProviders?: Array<{ encounterRole: string; provider: string }>;
  obs: Array<OpenmrsResource>;
  form?: string;
  visit?: string;
}
export type PatientSummary = {
  viralLoadValue: string;
  viralLoadDate: string;
  allVlResults: vlResults;
};
type vlResults = {
  value: Array<vl>;
};
type vl = {
  vl?: string;
  vlDate?: string;
};

export interface LocationData {
  display: string;
  uuid: string;
}

type Links = Array<{
  rel: string;
  uri: string;
}>;

export interface Concept {
  uuid: string;
  display: string;
  answers?: Concept[];
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
    display: string;
  }>;
  value: any;
  obsDatetime?: string;
}
