import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useStandardSchema(key: string) {
  const { data, error, isLoading } = useSWRImmutable<{ data }, Error>(
    `/ws/rest/v1/systemsetting?q=${key}&v=full`,
    openmrsFetch,
  );

  return {
    schema: data?.data,
    schemaProperties: data?.data?.results?.find((resource) => resource.property === 'kenyaemr.billing.exemptions'),
    error,
    isLoading,
  };
}
