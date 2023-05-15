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
