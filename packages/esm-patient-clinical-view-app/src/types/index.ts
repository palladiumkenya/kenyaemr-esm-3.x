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
    display?: string;
    conceptClass?: {
      uuid: string;
      display: string;
    };
    name?: {
      uuid: string;
      name: string;
    };
  };
  display?: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: any;
    display: string;
  }>;
  value: any;
  obsDatetime?: string;
}

export interface ConceptToFormLabelMap {
  display: string;
  answers: null | Array<string>;
}
