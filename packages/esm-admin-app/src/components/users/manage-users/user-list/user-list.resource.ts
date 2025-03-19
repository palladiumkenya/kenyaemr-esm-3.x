import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type UserResponse, type ProviderResponse } from '../../../../types';
import useSWR from 'swr';

export function useProvider() {
  const customRepresentation =
    'custom:(uuid,display,person:(uuid,display,gender),identifier,attributes:(uuid,display,attributeType:(uuid,display),value:(uuid,display))';

  const encodedRepresentation = encodeURIComponent(customRepresentation);
  const url = `${restBaseUrl}/provider?v=${encodedRepresentation}`;
  const { data, error, isLoading } = useSWR<{ data: { results: ProviderResponse[] } }>(url, openmrsFetch);
  const provider = data?.data?.results || [];

  return { provider, error, isLoading };
}

export const useUsers = () => {
  const customRepresentation =
    'custom:(uuid,display,username,systemId,person:(uuid,display,gender),roles:(uuid,display,description))';
  const encodedRepresentation = encodeURIComponent(customRepresentation);
  const url = `${restBaseUrl}/user?v=${encodedRepresentation}`;
  const { data, isLoading, error, mutate } = useSWR<FetchResponse<{ results: UserResponse[] }>>(url, openmrsFetch);
  const users = data?.data?.results || [];
  return {
    users,
    isLoading,
    mutate,
    error,
  };
};
