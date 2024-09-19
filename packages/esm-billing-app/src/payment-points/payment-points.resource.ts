import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PaymentPoint } from '../types';

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
