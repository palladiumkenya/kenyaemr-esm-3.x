export interface LabManifest {
  uuid: string;
  startDate: string;
  endDate: string;
  type: string;
  courrier: string;
  manifestId?: string;
  labPersonContact: string;
  status: string;
  dispatch: string;
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
