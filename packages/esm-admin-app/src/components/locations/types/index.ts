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

// OpenMRS format (legacy)
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

export interface FHIRLocation {
  resourceType: 'Location';
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    tag?: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  status: string;
  name: string;
  description?: string;
  address?: {
    extension?: Array<{
      url: string;
      extension?: Array<{
        url: string;
        valueString: string;
      }>;
    }>;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    country?: string;
  };
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  partOf?: {
    reference: string;
    type: string;
    display: string;
  };
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  meta?: {
    lastUpdated?: string;
    tag?: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  type: string;
  total?: number;
  link?: Array<{
    relation: string;
    url: string;
  }>;
  entry?: Array<{
    fullUrl: string;
    resource: FHIRLocation;
  }>;
}
