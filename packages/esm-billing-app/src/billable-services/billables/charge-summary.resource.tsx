import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PaymentMode } from '../../types';

export type ChargeAble = {
  uuid: string;
  name: string;
  shortName: string;
  serviceStatus: 'ENABLED' | 'DISABLED';
  stockItem: string;
  serviceType: {
    uuid: string;
    display: string;
    id: string;
  };
  servicePrices: Array<{
    uuid: string;
    name: string;
    price: number;
    paymentMode: PaymentMode;
  }>;
  concept: {
    uuid: string;
    display: string;
    id: string;
  };
};

type ChargeAblesResponse = {
  results: Array<ChargeAble>;
};

export const useChargeSummaries = () => {
  const url = `${restBaseUrl}/cashier/billableService?v=custom:(uuid,name,shortName,serviceStatus,serviceType:(uuid,id,display),servicePrices:(uuid,name,paymentMode,price),concept:(uuid,id,display))`;
  const { data, isLoading, isValidating, error, mutate } = useSWR<{ data: ChargeAblesResponse }>(url, openmrsFetch, {
    errorRetryCount: 0,
  });

  return {
    chargeSummaryItems: data?.data?.results ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
};
