import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { MappedAdrEncounter } from '../../types';

export const useAdrAssessmentEncounter = (fromDate: string, toDate?: string) => {
  const url = `${restBaseUrl}/kenyaemr/adrencounter?fromdate=${fromDate}&todate=${toDate}`;
  const { data, error, isLoading } = useSWR<{ data: Array<MappedAdrEncounter> }>(url, openmrsFetch);
  return {
    encounters: data?.data ?? [],
    isLoading,
    error,
  };
};
