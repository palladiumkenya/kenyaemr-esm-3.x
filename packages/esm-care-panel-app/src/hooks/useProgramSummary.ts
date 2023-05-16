import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ProgramSummary } from '../types/index';

export const useProgramSummary = (patientUuid: string) => {
  const programSummaryUrl = `/ws/rest/v1/kenyaemr/currentProgramDetails?patientUuid=${patientUuid}`;
  const { data, mutate, error, isLoading } = useSWR<{ data: ProgramSummary }>(programSummaryUrl, openmrsFetch);

  return {
    data: data?.data ? data?.data : null,
    isError: error,
    isLoading: isLoading,
  };
};
