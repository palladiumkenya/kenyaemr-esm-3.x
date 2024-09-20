import { openmrsFetch } from '@openmrs/esm-framework';
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
  const url = `/ws/rest/v2/cashier/timesheet`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    data: { results: Timesheet[] };
  }>(url, openmrsFetch, {
    errorRetryCount: 3,
  });

  return {
    timesheets: data?.data.results,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

// TODO why v2?
export const clockIn = (payload: { cashier: string; cashPoint: string; clockIn: string }) => {
  const url = `/ws/rest/v2/cashier/timesheet`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// TODO temporary clock out request function.
export const clockOut = (timesheetUUID: string, payload: { clockOut: string }) => {
  const url = `/openmrs/ws/rest/v2/kenyaemr/cashier/timesheet/${timesheetUUID}`;
  return openmrsFetch(url, {
    method: 'PUT',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
