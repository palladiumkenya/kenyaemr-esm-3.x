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

export const useReason = (searchTerm: string) => {
  const customRepresentation = 'custom:(uuid,name)';
  const url = `/ws/rest/v1/concept?v=${customRepresentation}&q=${searchTerm}&limit=10`;
  const { data, error } = useSWRImmutable<{ data: ReasonResponse }>(searchTerm ? url : null, openmrsFetch);

  return { data: data?.data?.results, error };
};
