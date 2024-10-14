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
export interface DeceasedPatientResponse {
  results: Patient[];
}

export interface ChartConfig {
  freeTextFieldConceptUuid: string;
  offlineVisitTypeUuid: string;
  visitTypeResourceUrl: string;
  showRecommendedVisitTypeTab: boolean;
  visitAttributeTypes: Array<{
    uuid: string;
    required: boolean;
    displayInThePatientBanner: boolean;
    showWhenExpression?: string;
  }>;
  showServiceQueueFields: boolean;
  visitQueueNumberAttributeUuid: string;
  showAllEncountersTab: boolean;
  defaultFacilityUrl: string;
  showUpcomingAppointments: boolean;
  logo: {
    src: string;
    alt: string;
    name: string;
  };
  disableChangingVisitLocation: boolean;
  numberOfVisitsToLoad: number;
  showExtraVisitAttributesSlot: boolean;
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
