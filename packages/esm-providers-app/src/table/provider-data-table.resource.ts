import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR, { mutate } from 'swr';
import { ProviderResponse, UserRoles } from '../types';

export function useProviders() {
  const customRepresentation =
    'custom:(uuid,display,person:(uuid,display,gender),identifier,attributes:(uuid,display,attributeType:(uuid,display),value:(uuid,display,tags:(uuid,display)))';

  const encodedRepresentation = encodeURIComponent(customRepresentation);
  const url = `/ws/rest/v1/provider?v=${encodedRepresentation}`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: ProviderResponse[] }>>(url, openmrsFetch);
  const provider = data?.data?.results || [];

  return { provider, error, isLoading };
}
