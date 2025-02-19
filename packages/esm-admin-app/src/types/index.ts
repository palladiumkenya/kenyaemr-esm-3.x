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
