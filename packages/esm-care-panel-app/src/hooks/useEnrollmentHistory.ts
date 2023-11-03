import useSWR from 'swr';
import groupBy from 'lodash/groupBy';
import { openmrsFetch } from '@openmrs/esm-framework';

export const useEnrollmentHistory = (patientUuid: string) => {
  const enrollmentHistoryUrl = `/ws/rest/v1/kenyaemr/patientHistoricalEnrollment?patientUuid=${patientUuid}`;
  const { data, isValidating, error, isLoading } = useSWR<{ data: Array<Record<string, any>> }>(
    enrollmentHistoryUrl,
    openmrsFetch,
  );

  return {
    error: error,
    isLoading: isLoading,
    enrollments: groupBy(data?.data ?? [], 'programName') ?? [],
    isValidating,
  };
};
