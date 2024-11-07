import { FetchResponse, openmrsFetch, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PaymentPoint, Timesheet } from '../types';

export const usePaymentPoints = () => {
  const url = `/ws/rest/v1/cashier/cashPoint`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    data: { results: PaymentPoint[]; length: number };
  }>(url, openmrsFetch, {
    errorRetryCount: 3,
  });

  return {
    paymentPoints: data?.data.results.map((res) => {
      return {
        ...res,
        id: res.uuid,
      };
    }),
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const createPaymentPoint = (payload: {
  name: string;
  description: string;
  retired: boolean;
  location: string;
}) => {
  const url = `/ws/rest/v1/cashier/cashPoint`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const useTimeSheets = () => {
  const url = `/ws/rest/v1/cashier/timesheet?v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    data: { results: Timesheet[] };
  }>(url, openmrsFetch, {
    errorRetryCount: 3,
  });

  return {
    timesheets: data?.data.results ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const clockIn = (payload: { cashier: string; cashPoint: string; clockIn: string }) => {
  const url = `/ws/rest/v1/cashier/timesheet`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const clockOut = (timesheetUUID: string, payload: { clockOut: string }) => {
  const url = `/ws/rest/v1/cashier/timesheet/${timesheetUUID}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

interface Person {
  uuid: string;
}

interface ProviderResponse {
  uuid: string;
  person: Person;
}

interface UsersResponse {
  uuid: string;
  person: Person;
}

export function useProviders() {
  const url = `/ws/rest/v1/provider?v=custom:(uuid,person:(uuid)`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: ProviderResponse[] }>>(url, openmrsFetch);
  const providers = data?.data?.results || [];

  return { providers, error, isLoading };
}

export function useUsers() {
  const url = `/ws/rest/v1/user?v=custom:(uuid,person:(uuid)`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: UsersResponse[] }>>(url, openmrsFetch);
  const users = data?.data?.results || [];

  return { users, error, isLoading };
}

// this hook gives you the providerUUID of the current signed in user.
export const useProviderUUID = () => {
  const { user } = useSession();
  const { providers, error, isLoading } = useProviders();
  const { users, error: fetchingUsersError, isLoading: isLoadingUsers } = useUsers();

  const userPerson = users?.find((u) => u.uuid === user.uuid)?.person;
  const providerUUID = providers?.find((p) => p.person.uuid === userPerson?.uuid)?.uuid;

  return { providerUUID, isLoading: isLoading || isLoadingUsers, error: error || fetchingUsersError };
};
