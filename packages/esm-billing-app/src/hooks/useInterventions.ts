import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { SHAIntervension } from '../types';

export const useInterventions = (code: string) => {
  const url = `https://payers.apeiro-digital.com/api/v1/master/benefit-master/code?searchKey=${code}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Array<SHAIntervension>>>(url, openmrsFetch);
  return {
    isLoading,
    interventions: data?.data ?? [],
    error,
  };
};
