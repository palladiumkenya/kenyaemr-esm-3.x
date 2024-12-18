import { FetchResponse, OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { Schema } from '../types';

interface SavePayload {
  value?: string;
}

export function useSystemBillableSetting(key: string) {
  const { data, error, isLoading, mutate } = useSWRImmutable<{ data: { results: Array<OpenmrsResource> } }, Error>(
    `/ws/rest/v1/systemsetting?q=${key}&v=full`,
    openmrsFetch,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const billableExceptionResource = data?.data?.results?.find(
    (resource) => resource.property === 'kenyaemr.billing.exemptions',
  );

  return { billableExceptionResource, isLoading, mutate, error };
}

export async function saveExemptionSchema(schema: Schema, key: string): Promise<FetchResponse<Schema>> {
  const body: SavePayload = { value: JSON.stringify(schema) };
  const headers = { 'Content-Type': 'application/json' };

  return openmrsFetch(`/ws/rest/v1/systemsetting/${key}`, {
    method: 'POST',
    headers,
    body,
  });
}

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
