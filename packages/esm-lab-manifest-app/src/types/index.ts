export interface MappedLabManifest {
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

export interface LabManifest {
  uuid: string;
  identifier?: string;
  startDate: string;
  endDate: string;
  dispatchDate: string;
  courier?: string;
  courierOfficer?: string;
  status?: string;
  county?: string;
  subCounty?: string;
  facilityEmail?: string;
  facilityPhoneContact?: string;
  clinicianPhoneContact?: string;
  clinicianName?: string;
  labPocPhoneNumber?: string;
  manifestType?: number;
  labManifestOrders: Array<LabManifest>;
}

export interface LabManifestSample {
  uuid: string;
  id: number;
  sampleType: string;
  status: string;
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
