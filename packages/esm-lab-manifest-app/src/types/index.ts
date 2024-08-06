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
  samples: Array<LabManifestSample>;
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
  labManifestOrders: Array<LabManifestSample>;
}

export interface Order {
  patient: {
    id: number;
    uuid: string;
    identifiers: Array<{ identifier: string; uuid: string }>;
  };
}

export interface LabManifestSample {
  uuid: string;
  id: number;
  sampleType: string;
  status: string;
  result: string;
  batchNumber: string;
  dateSent: string;
  resultDate: string;
  order: Order;
}

export interface ActiveRequest {
  Orders: Array<ActiveRequestOrder>;
  cccNumberType: number;
  heiNumberType: number;
}

export interface ActiveRequestOrder {
  orderId: number;
  orderUuid: string;
  patientId: number;
  patientUuid: string;
  patientName: string;
  cccKdod: string;
  dateRequested: string;
  payload: string;
  hasProblem;
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
