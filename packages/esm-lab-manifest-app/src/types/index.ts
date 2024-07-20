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
