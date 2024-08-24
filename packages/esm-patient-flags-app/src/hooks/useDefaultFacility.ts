import { FetchResponse, openmrsFetch, restBaseUrl, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { DefaultFacility } from '../types';

export function useDefaultFacility() {
  const { authenticated } = useSession();
  const url = `${restBaseUrl}/kenyaemr/default-facility`;
  const { data, isLoading, error } = useSWR<FetchResponse<DefaultFacility>>(
    authenticated ? url : null,
    openmrsFetch,
    {},
  );
  return {
    isLoading,
    defaultFacility: data?.data,
    error,
  };
}
