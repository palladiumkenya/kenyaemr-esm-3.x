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
