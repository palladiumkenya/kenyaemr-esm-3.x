export interface LabManifest {
  uuid: string;
  startDate: string;
  endDate: string;
  manifestType?: string;
  courierName?: string;
  manifestId?: string;
  labPersonContact?: string;
  manifestStatus?: string;
  dispatchDate: string;
  clinicianContact?: string;
  clinicianName?: string;
  county?: string;
  subCounty?: string;
  facilityEmail?: string;
  facilityPhoneContact?: string;
  personHandedTo?: string;
}

export interface LabManifestSample {
  uuid: string;
}

export interface ActiveRequests {
  uuid: String;
}

export interface Constiuency {
  name: string;
  code: string;
}

export interface County {
  name: string;
  number: string;
  capital: string;
  constituencies: Array<Constiuency>;
}
