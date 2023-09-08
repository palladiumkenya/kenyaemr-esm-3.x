import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { SHRSummary } from '../types/index';

export const useSHRSummary = (patientUuid: string) => {
  const shrSummaryUrl = `/ws/rest/v1/kenyaemril/shrPatientSummary?patientUuid=${patientUuid}`;
  const { data, mutate, error, isLoading } = useSWR<{ data: SHRSummary }>(shrSummaryUrl, openmrsFetch);

  return {
    data: data?.data ? data?.data : null,
    isError: error,
    isLoading: isLoading,
  };
};
