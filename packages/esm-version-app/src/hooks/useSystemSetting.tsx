import { FetchResponse, OpenmrsResource, openmrsFetch, restBaseUrl, useSession } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import useSWR from 'swr';
import { DefaultFacility } from '../types';

export function useSystemSetting(key: string) {
  const { data, isLoading } = useSWRImmutable<{ data: { results: Array<OpenmrsResource> } }>(
    `/ws/rest/v1/systemsetting?q=${key}&v=full`,
    openmrsFetch,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const mflCodeResource = data?.data?.results?.find((resource) => resource.property === 'facility.mflcode');

  return { mflCodeResource, isLoading };
}

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
