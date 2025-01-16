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
export interface DefaultFacility {
  locationId: number;
  uuid: string;
  display: string;
  operationalStatus: string;
  shaContracted: string;
  shaFacilityExpiryDate: string;
}

export interface FacilityData {
  shaKephLevel?: string;
  mflCode?: string;
  display?: string;
  operationalStatus?: string;
  shaStatus?: string;
  shaContracted?: string;
  shaFacilityExpiryDate?: string;
}
