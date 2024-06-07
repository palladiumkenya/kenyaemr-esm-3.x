import { OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

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

  const mflCodeValue = mflCodeResource?.value;

  return { mflCodeValue, isLoading };
}
