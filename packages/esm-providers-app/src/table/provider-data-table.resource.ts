import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ProviderResponse, UserRoles } from '../types';

export function useProviders() {
  const customRepresentation =
    'custom:(uuid,display,person:(uuid,display),identifier,attributes:(uuid,display,attributeType:(uuid,display),value:(uuid,display,tags:(uuid,display)))';

  const encodedRepresentation = encodeURIComponent(customRepresentation);
  const url = `/ws/rest/v1/provider?v=${encodedRepresentation}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: ProviderResponse[] }>>(url, openmrsFetch);
  const provider = data?.data?.results || [];

  return { provider, error, isLoading, mutate };
}

export function useUser() {
  const customRepresentation =
    'custom:(uuid,display,person:(uuid,display,gender,attributes:(uuid,display)),privileges:(uuid,display))';

  const encodedRepresentation = encodeURIComponent(customRepresentation);
  const url = `/ws/rest/v1/user?v=${encodedRepresentation}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: UserRoles[] }>>(url, openmrsFetch);
  const userRoles = data?.data?.results || [];

  return { userRoles, error, isLoading, mutate };
}
