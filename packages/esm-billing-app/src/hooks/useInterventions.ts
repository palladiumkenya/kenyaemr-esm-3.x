import { FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingConfig } from '../config-schema';
import { SHAIntervension } from '../types';
import { interventions } from './benefits.mock';

export const useInterventions = (code: string) => {
  const { hieBaseUrl } = useConfig<BillingConfig>();

  const url = `${hieBaseUrl}/master/benefit-master/code?searchKey=${code}`;
  const { isLoading, error, data } = useSWR<Array<SHAIntervension>>(url, async (key) => {
    await new Promise((resolve, reject) => {
      setTimeout(resolve, 2000);
    });
    return interventions?.filter((inter) => inter.interventionCode.includes(code));
  });
  return {
    isLoading,
    interventions: data ?? [],
    error,
  };
};
