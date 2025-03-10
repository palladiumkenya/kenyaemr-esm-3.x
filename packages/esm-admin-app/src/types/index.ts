export interface ETLResponse {
  script_name: string;
  start_time: string;
  stop_time: string;
  status: string;
}

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
}
export interface FrontendModule {
  name: string;
  version?: string;
}
export interface SHAFacility {
  operationalStatus: string;
  approved: string;
  kephLevel: string;
  shaFacilityId: string;
  shaFacilityExpiryDate: string;
  registrationNumber: string;
  mflCode: string;
  shaFacilityLicenseNumber: string;
  facilityRegistryCode: string;
  source: string;
}

export interface DefaultFacility {
  locationId: number;
  uuid: string;
  display: string;
}

export interface PractitionerResponse {
  id: string;
  link: Link[];
  meta: Metadata;
  entry: Entry[];
}

interface Metadata {
  lastUpdated: string;
}
interface Link {
  relation: string;
  url: string;
}
interface Entry {
  resource: {
    id: string;
    identifier: IdentifierType[];
    active: boolean;
    name: Name[];
    telecom: ContactList[];
    extension: Extension[];
    gender: string;
    qualification: Qualification[];
  };
}
export interface Extension {
  url: string;
  valueCodeableConcept: ValueCodeableConcept;
}

export interface ValueCodeableConcept {
  coding: Coding[];
}

export interface Coding {
  system: string;
  code: string;
  display: string;
}

interface IdentifierType {
  type: {
    coding: {
      code: string;
      display: string;
      system?: string;
    }[];
  };
  value: string;
  period?: {
    start?: string;
    end?: string;
  };
}

interface ContactList {
  system: string;
  value?: string;
}

interface Name {
  text: string;
}

interface Qualification {
  extension: QualificationExtension[];
  code: {
    coding: {
      system?: string;
      code?: string;
      display: string;
    }[];
  };
  period: {
    start: string;
    end: string;
  };
}

interface QualificationExtension {
  url: string;
  valueCoding?: {
    system?: string;
    code?: string;
    display?: string;
  };
  valueString?: string;
  valueCodeableConcept?: {
    coding: {
      system: string;
      code: string;
      display: string;
    }[];
  };
}
