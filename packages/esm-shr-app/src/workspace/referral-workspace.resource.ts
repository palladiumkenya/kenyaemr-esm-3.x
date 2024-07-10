import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

export interface Concept {
  uuid: string;
  name: {
    name: string;
  };
  conceptClass: {
    name: string;
  };
}

export interface ReasonResponse {
  results: Concept[];
}
export interface Facility {
  uuid: string;
  name: string;
  attributes: [
    {
      value: string;
    },
  ];
}

export interface FacilityResponse {
  results: Facility[];
}

export const useReason = (searchTerm: string) => {
  const customRepresentation = 'custom:(uuid,name)';
  const url = `/ws/rest/v1/concept?v=${customRepresentation}&q=${searchTerm}&limit=15`;
  const { data, error } = useSWRImmutable<{ data: ReasonResponse }>(searchTerm ? url : null, openmrsFetch);

  return { data: data?.data?.results, error };
};

export const useFacility = (searchTerm: string) => {
  const customRepresentation = 'custom:(uuid,name,attributes:(value))';
  const url = `/ws/rest/v1/location?v=${customRepresentation}&q=${searchTerm}&limit=15`;
  const { data, error } = useSWRImmutable<{ data: FacilityResponse }>(searchTerm ? url : null, openmrsFetch);

  return { data: data?.data?.results, error };
};
