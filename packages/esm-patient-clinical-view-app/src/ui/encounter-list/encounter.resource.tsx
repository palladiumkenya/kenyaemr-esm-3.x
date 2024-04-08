import { OpenmrsResource, Visit } from '@openmrs/esm-framework';

export function mapEncounters(encounters: Array<any>): MappedEncounter[] {
  return encounters?.map((enc) => ({
    id: enc?.uuid,
    datetime: enc?.encounterDatetime,
    obs: enc?.obs,
    provider: enc?.encounterProviders?.length > 0 ? enc?.encounterProviders[0].provider?.person?.display : '--',
  }));
}

export interface MappedEncounter {
  id: string;
  datetime: string;
  obs: Array<Observation>;
  provider: string;
}

export interface Encounter {
  uuid: string;
  encounterDatetime: string;
  encounterProviders: Array<EncounterProvider>;
  obs: Array<Observation>;
  visit: Visit;
  encounterType: OpenmrsResource;
  form: OpenmrsResource;
}

export interface EncounterProvider {
  uuid: string;
  display: string;
  encounterRole: {
    uuid: string;
    display: string;
  };
  provider: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
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
