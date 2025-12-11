import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { CarePanelConfig } from '../config-schema';

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
  const { excludedCarePrograms } = useConfig<CarePanelConfig>();

  const eligibleCarePrograms = useMemo(
    () =>
      data?.data?.filter(
        (careProgram) => careProgram.enrollmentStatus !== 'active' && !excludedCarePrograms.includes(careProgram.uuid),
      ) ?? [],
    [data, excludedCarePrograms],
  );

  const activeCarePrograms = useMemo(
    () =>
      data?.data?.filter(
        (careProgram) => careProgram.enrollmentStatus !== 'active' && !excludedCarePrograms.includes(careProgram.uuid),
      ) ?? [],
    [data?.data, excludedCarePrograms],
  );
  return {
    eligibleCarePrograms,
    activeCarePrograms,
    error,
    isLoading,
    isValidating,
    mutateEligiblePrograms,
  };
};
