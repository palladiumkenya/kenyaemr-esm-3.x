import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';

export interface Enrollement {
  uuid: string;
  display: string;
  program: Program;
  dateEnrolled: string;
  dateCompleted?: string;
  location: Location;
  states: Array<{ uuid: string; retired: boolean; concept: Concept }>;
}

export interface Program {
  display: string;
  name: string;
  uuid: string;
  retired: boolean;
  description: string;
  concept: Concept;
  allWorkflows: any[];
  outcomesConcept: any;
  resourceVersion: string;
}

export interface Concept {
  uuid: string;
  display: string;
}

export interface Location {
  uuid: string;
  display: string;
}

export const usePrograms = () => {
  const rep = 'custom:(uuid,display,name,allWorkflows,concept:(uuid,display))';
  const url = `${restBaseUrl}/program?v=${rep}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: Array<Program> }>>(url, openmrsFetch);
  return {
    isLoading,
    error,
    programs: data?.data?.results ?? [],
    mutate,
  };
};

export const usePatientEnrolledPrograms = (patientUuid: string) => {
  const rep =
    'custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display),states:(startDate,endDate,voided,state:(uuid,concept:(display))))';
  const url = `${restBaseUrl}/programenrollment?v=${rep}&patient=${patientUuid}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: Array<Enrollement> }>>(url, openmrsFetch);
  return {
    isLoading,
    error,
    enrollments: data?.data?.results ?? [],
    mutate,
  };
};

export const usePatientPrograms = (patientUuid: string) => {
  const { error: programsError, isLoading: isLoadingPrograms, programs, mutate: mutatePrograms } = usePrograms();
  const {
    error: enrollmentError,
    isLoading: isLoadingEnrollment,
    enrollments,
    mutate: mutateEnrollments,
  } = usePatientEnrolledPrograms(patientUuid);

  const unenrolledPrograms = useMemo(() => {
    return programs.filter(
      (program) => enrollments.findIndex((enrollment) => enrollment.program.uuid === program.uuid) === -1,
    );
  }, [programs, enrollments]);

  return {
    isLoading: isLoadingEnrollment || isLoadingPrograms,
    error: programsError ?? enrollmentError,
    allPrograms: programs,
    enrolledPrograms: enrollments,
    unenrolledPrograms,
    mutate: () => {
      mutateEnrollments();
      mutatePrograms();
    },
  };
};
