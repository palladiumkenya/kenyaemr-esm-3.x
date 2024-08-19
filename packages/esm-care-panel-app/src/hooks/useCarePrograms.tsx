import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export type PatientCarePrograms = {
  uuid: string;
  display: string;
  enrollmentFormUuid: string;
  enrollmentStatus: string;
  discontinuationFormUuid: string;
  enrollmentDetails?: { uuid: string; dateCompleted: string; location: string; dateEnrolled: string };
};

export const useCarePrograms = (patientUuid: string) => {
  const url = `/ws/rest/v1/kenyaemr/eligiblePrograms?patientUuid=${patientUuid}`;
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutateEligiblePrograms,
  } = useSWR<{ data: Array<PatientCarePrograms> }>(url, openmrsFetch);

  return {
    carePrograms: data?.data?.filter((careProgram) => careProgram.enrollmentStatus !== 'active') ?? [],
    error,
    isLoading,
    isValidating,
    mutateEligiblePrograms,
  };
};
