import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Person } from '../types';

const usePersonAttributes = (personUuid?: string) => {
  const url = `${restBaseUrl}/person/${personUuid}/attribute`;
  const { data, error, isLoading, mutate } = useSWR<
    FetchResponse<{
      results: Person['attributes'];
    }>
  >(personUuid ? url : null, openmrsFetch);
  return { error, isLoading, mutate, attributes: data?.data?.results ?? [] };
};

export default usePersonAttributes;
