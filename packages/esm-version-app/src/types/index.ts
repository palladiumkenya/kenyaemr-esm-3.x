export interface FrontendModule {
  name: string;
  version?: string;
}

export interface DefaultFacility {
  locationId: number;
  uuid: string;
  display: string;
  operationalStatus: string;
  shaContracted: string;
  shaFacilityExpiryDate: string;
}

export interface FacilityContacts {
  tel?: string;
  email?: string;
  emergency?: string;
  address?: string;
  website?: string;
}

export interface FacilityInformation {
  facilityName?: string;
  tagline?: string;
  logoPath?: string;
  contacts?: FacilityContacts;
}
