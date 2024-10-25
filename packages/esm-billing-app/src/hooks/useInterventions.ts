import { FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingConfig } from '../config-schema';
import { SHAIntervension } from '../types';

export const useInterventions = (code: string) => {
  const { hieBaseUrl } = useConfig<BillingConfig>();

  const url = `${hieBaseUrl}/master/benefit-master/code?searchKey=${code}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Array<SHAIntervension>>>(url, openmrsFetch);
  return {
    isLoading,
    interventions: data?.data ?? [],
    error,
  };
};
