export interface AdmissionLocationResponse {
  uuid: string;
  wardName: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  ward: {
    uuid: string;
    display: string;
    name: string;
    tags: Array<{
      uuid: string;
      display: string;
    }>;
    parentLocation: {
      uuid: string;
      display: string;
    };
  };
}

export interface LocationTagsResponse {
  results: Array<{
    uuid: string;
    display: string;
    name: string;
    description: string;
  }>;
}
export interface LocationResponse {
  uuid: string;
  display: string;
  name: string;
  description: string;
  stateProvince: string;
  country: string;
  countyDistrict: string;
  address5: string;
  address6: string;
  tags: Array<{
    uuid: string;
    display: string;
    name: string;
    description: string;
  }>;
  attributes: Array<{
    display: string;
    uuid: string;
    attributeType: {
      uuid: string;
      display: string;
    };
    value: string;
  }>;
}
