import { OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

interface Modules extends OpenmrsResource {
  version: string;
  name: string;
}

export function useModules() {
  const { data, isLoading } = useSWRImmutable<{ data: { results: Array<Modules> } }>(
    'ws/rest/v1/module?v=custom:(uuid,name,version)',
    openmrsFetch,
  );

  return { modules: data?.data?.results ?? [], isLoading };
}

export function useGlobalProperty(property: string) {
  const { data, isLoading } = useSWRImmutable<{ data: { results: Array<OpenmrsResource> } }>(
    `/ws/rest/v1/systemsetting?q=${property}&v=full`,
    openmrsFetch,
  );

  return { data: data?.data?.results?.[0] ?? [], isLoading };
}
