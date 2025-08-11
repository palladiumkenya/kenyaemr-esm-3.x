import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import uniqBy from 'lodash-es/uniqBy';
import { PatientProgram } from '@openmrs/esm-patient-common-lib';
const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display))`;

export const usePatientEnrollment = (patientUuid: string) => {
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<PatientProgram> } }>(
    `${restBaseUrl}/programenrollment?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  const activePatientEnrollment = useMemo(
    () =>
      data?.data.results
        .sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1))
        .filter((enrollment) => enrollment.dateCompleted === null) ?? [],
    [data?.data.results],
  );

  const patientEnrollments = useMemo(
    () => data?.data.results.sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1)) ?? [],
    [data?.data.results],
  );

  return {
    activePatientEnrollment: uniqBy(activePatientEnrollment, (program) => program?.program?.uuid),
    patientEnrollments: uniqBy(patientEnrollments, (program) => program?.program?.uuid),
    error,
    isLoading,
    isValidating,
  };
};
