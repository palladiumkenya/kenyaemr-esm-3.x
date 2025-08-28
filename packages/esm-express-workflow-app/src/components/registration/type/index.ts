export interface LocalPatientApiResponse {
  results: LocalResponse;
}

export type LocalResponse = Array<LocalPatient>;

export interface LocalPatient {
  patientId: number;
  uuid: string;
  identifiers: {
    display: string;
    uuid: string;
    identifier: string;
    identifierType: {
      uuid: string;
      display: string;
      links: {
        rel: string;
        uri: string;
        resourceAlias: string;
      }[];
    };
    location: {
      uuid: string;
      display: string;
      links: {
        rel: string;
        uri: string;
        resourceAlias: string;
      }[];
    };
    preferred: boolean;
    voided: boolean;
    links: {
      rel: string;
      uri: string;
      resourceAlias: string;
    }[];
    resourceVersion: string;
  }[];
  display: string;
  patientIdentifier: {
    uuid: string;
    identifier: string;
  };
  person: {
    gender: string;
    age: number;
    birthdate: string;
    birthdateEstimated: boolean;
    personName: {
      display: string;
      uuid: string;
      givenName: string;
      middleName: string;
      familyName: string;
      familyName2: null;
      voided: boolean;
      links: {
        rel: string;
        uri: string;
        resourceAlias: string;
      }[];
      resourceVersion: string;
    };
    addresses: {
      display: null;
      uuid: string;
      preferred: boolean;
      address1: null;
      address2: string;
      cityVillage: string;
      stateProvince: null;
      country: null;
      postalCode: null;
      countyDistrict: null;
      address3: null;
      address4: null;
      address5: string;
      address6: string;
      startDate: null;
      endDate: null;
      latitude: null;
      longitude: null;
      voided: boolean;
      address7: null;
      address8: null;
      address9: null;
      address10: null;
      address11: null;
      address12: null;
      address13: null;
      address14: null;
      address15: null;
      links: {
        rel: string;
        uri: string;
        resourceAlias: string;
      }[];
      resourceVersion: string;
    }[];
    display: string;
    dead: boolean;
    deathDate: null;
  };
  attributes: {
    value: string;
    attributeType: {
      uuid: string;
      display: string;
    };
  }[];
}

export interface IdentifierTypeItem {
  id: string;
  key: string;
  name: string;
  text: string;
}

export interface EligibilityResponse {
  requestIdType: number;
  requestIdNumber: string;
  memberCrNumber: string;
  fullName: string;
  memberType: string;
  coverageStartDate: Date;
  coverageEndDate: Date;
  status: number;
  message: string;
  reason: string;
  possibleSolution: null;
  coverageType: string;
  primaryContributor: null;
  employerDetails: EmployerDetails;
  dependants: Array<unknown>;
  active: boolean;
}

export interface EmployerDetails {
  employerName: string;
  jobGroup: string;
  scheme: Scheme;
}

export interface Scheme {
  schemeCode: string;
  schemeName: string;
  schemeCategoryCode: string;
  schemeCategoryName: string;
  memberPolicyStartDate: string;
  memberPolicyEndDate: string;
  joinDate: string;
  leaveDate: string;
}

export type HIEEligibilityResponse = {
  insurer: string;
  inforce: boolean;
  start: string;
  eligibility_response: EligibilityResponse | string;
  end: string;
};

export interface HIEBundleResponse {
  resourceType: string;
  id: string;
  meta: { lastUpdated: string };
  type: string;
  total: number;
  link?: { relation: string; url: string }[];
  entry?: {
    resource: {
      resourceType: string;
      id: string;
      extension?: { url: string; valueString?: string }[];
      identifier: {
        use: string;
        type: { coding: { system: string; code: string; display: string }[] };
        value: string;
      }[];
      active: boolean;
      name: { text: string; family: string; given: string[] }[];
      telecom?: { system: string; value: string }[];
      gender: string;
      birthDate: string;
      address: { extension?: { url: string; valueString?: string }[]; city: string; country: string }[];
      contact?: {
        id: string;
        extension?: {
          url: string;
          valueString?: string;
          valueIdentifier?: {
            use: string;
            type: { coding: { system: string; code: string; display: string }[] };
            value: string;
          };
        }[];
        relationship: { coding: { system: string; code: string; display: string }[] }[];
        name: { text: string; family: string; given: string[] };
        address: { extension?: { url: string; valueString?: string }[]; city: string; country: string };
        gender: string;
        telecom?: { system: string; value: string }[];
      }[];
    };
  }[];
}
