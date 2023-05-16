import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const useEnrollmentHistory = (patientUuid: string) => {
  const enrollmentHistoryUrl = `/ws/rest/v1/kenyaemr/patientHistoricalEnrollment?patientUuid=${patientUuid}`;
  const { data, mutate, error, isLoading } = useSWR<{ data: Array<any> }>(enrollmentHistoryUrl, openmrsFetch);

  return {
    data: data?.data ? data.data : null,
    isError: error,
    isLoading: isLoading,
  };
};
