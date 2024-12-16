import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR, { mutate } from 'swr';
import { Roles, User, UserSchema } from './types';

export const useUser = () => {
  const url = `${restBaseUrl}/user?v=full`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<User> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    users: data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};

export const createUser = (user: Partial<UserSchema>, uuid?: string) => {
  const url = uuid ? `${restBaseUrl}/user/${uuid}` : `${restBaseUrl}/user`;

  return openmrsFetch(url, {
    method: 'POST',
    body: user,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const handleMutation = (url: string) => {
  mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
};

export const useRoles = () => {
  const url = `${restBaseUrl}/role?v=full`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<Roles> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    roles: data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};
