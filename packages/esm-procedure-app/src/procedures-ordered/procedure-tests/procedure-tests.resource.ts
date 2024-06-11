import { FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Result } from '../../patient-chart/patient-procedure-order-results.resource';
export function useGetLabOrders(encounterUuid: string) {
  const apiUrl = `${restBaseUrl}/encounter/${encounterUuid}?v=full`;

  const { data, error, isLoading } = useSWR<{ data: Result }, Error>(apiUrl, openmrsFetch);

  return {
    labOrders: data?.data ? data?.data?.orders : [],
    isLoading,
    isError: error,
  };
}
