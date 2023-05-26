import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { HivSummary } from '../types/index';

export const useHivSummary = (patientUuid: string) => {
  const hivSummaryUrl = `/ws/rest/v1/kenyaemr/hiv-care-panel?patientUuid=${patientUuid}&isComplete=true`;
  const { data, mutate, error, isLoading } = useSWR<{ data:  HivSummary }>(
    hivSummaryUrl,
    openmrsFetch,
  );
  
  return {
    data: data?.data ? data?.data : null,
    isError: error,
    isLoading: isLoading
  }
}