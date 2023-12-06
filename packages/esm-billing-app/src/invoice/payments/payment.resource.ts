import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

type PaymentMethod = {
  uuid: string;
  description: string;
  name: string;
  retired: boolean;
};

const swrOption = {
  errorRetryCount: 2,
};

export const usePaymentModes = () => {
  const url = `/ws/rest/v1/cashier/paymentMode`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<PaymentMethod> } }>(
    url,
    openmrsFetch,
    swrOption,
  );

  return {
    paymentModes: data?.data?.results ?? [],
    isLoading,
    mutate,
    error,
  };
};
