import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { MappedCbEncounter } from '../../types';

export const useCrossBorderEncounter = (fromDate: string, toDate?: string) => {
  const url = `${restBaseUrl}/kemrcrossborder/cbencounter?fromdate=${fromDate}&todate=${toDate}`;
  const { data, error, isLoading } = useSWR<{ data: Array<MappedCbEncounter> }>(url, openmrsFetch);
  return {
    encounters: data?.data ?? [],
    isLoading,
    error,
  };
};
