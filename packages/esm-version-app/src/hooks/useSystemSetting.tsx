import { OpenmrsResource, openmrsFetch, useSession } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import useSWR from 'swr';

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
  const url = '/ws/rest/v1/kenyaemr/default-facility';
  const { data } = useSWR<{ data: OpenmrsResource }>(authenticated ? url : null, openmrsFetch, {});
  return data?.data ?? ({} as OpenmrsResource);
}
