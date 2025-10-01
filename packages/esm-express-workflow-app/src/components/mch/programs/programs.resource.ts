import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { usePatientEnrolledPrograms, usePrograms } from '../mch.resource';
import { useMemo } from 'react';

const programForms = [
  {
    programName: 'PNC',
    programUuid: '286598d5-1886-4f0d-9e5f-fa5473399cee',
    forms: [
      { formName: 'MCH Postnatal Visit Form', formUuId: '72aa78e0-ee4b-47c3-9073-26f3b9ecc4a7' },
      { formName: 'PNC Services Discontinuation', formUuId: '30db888b-d6d3-47fb-b0c9-dbdf10a57ff5' },
    ],
  },
  {
    programName: 'MCH - Child Services',
    programUuid: 'c2ecdf11-97cd-432a-a971-cfd9bd296b83',
    forms: [
      { formName: 'Child welafare clinic form', formUuId: '755b59e6-acbb-4853-abaf-be302039f902' },
      { formName: 'Child Welfare Services Discontinuation', formUuId: '1dd02c43-904b-4206-8378-7b1a8414c326' },
      { formName: 'Test', formUuId: 'e958f902-64df-4819-afd4-7fb061f59308' },
    ],
  },
  {
    programName: 'MCH - Child Services',
    programUuid: 'c2ecdf11-97cd-432a-a971-cfd9bd296b83',
    forms: [
      { formName: 'Child welafare clinic form', formUuId: '755b59e6-acbb-4853-abaf-be302039f902' },
      { formName: 'MCH Postnatal Visit Form', formUuId: '72aa78e0-ee4b-47c3-9073-26f3b9ecc4a7' },
    ],
  },
  {
    programName: 'Nutrition',
    programUuid: '504f179b-4a13-4790-9ecd-ca4963448af8',
    forms: [
      { formName: 'Nutrition form', formUuId: 'b8357314-0f6a-4fc9-a5b7-339f47095d62' },
      { formName: 'Nutrition Services Discontinuation', formUuId: '0648a046-f404-4246-806f-c9ee78232d6d' },
    ],
  },
  {
    programName: 'Family Planning',
    programUuid: '191269d2-9973-4958-9936-f687ed771050',
    forms: [
      { formName: 'Family Planning Form', formUuId: 'a52c57d4-110f-4879-82ae-907b0d90add6' },
      { formName: 'Family Planning Discontinuation', formUuId: 'efc782ea-9a16-4791-824a-18be7417eda4' },
    ],
  },
  {
    programName: 'Family Planning',
    programUuid: '191269d2-9973-4958-9936-f687ed771050',
    forms: [
      { formName: 'Family Planning Form', formUuId: 'a52c57d4-110f-4879-82ae-907b0d90add6' },
      { formName: 'Family Planning Discontinuation', formUuId: 'efc782ea-9a16-4791-824a-18be7417eda4' },
    ],
  },
  {
    programName: 'Pre-Conception care program',
    programUuid: '191269d2-9973-4958-9936-f687ed771050', // TODO Use actual program uuid when added
    forms: [
      { formName: 'Family Planning Form', formUuId: 'a52c57d4-110f-4879-82ae-907b0d90add6' },
      { formName: 'Family Planning Discontinuation', formUuId: 'efc782ea-9a16-4791-824a-18be7417eda4' },
    ],
  },
];

export const getProgramForms = (programUuid: string) => {
  const program = programForms.find((p) => p.programUuid === programUuid);
  if (!program) {
    return [];
  }
  return program.forms;
};

/**
 * PNC Program dont exist and need creation
 * is program 'MCH - Child Services' same as CWC as used in exel if not should be craeted
 * is form "CWC Follow Up" same as "Child Welfare clinic form" as used in exel
 * Is discontinuation form a JSON form specific to a program
 * Are program uuids changi anytime soon?
 * preconception care program dont exists
 */

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

export const usePatientPrograms = (patientUuid: string) => {
  const { error: programsError, isLoading: isLoadingPrograms, programs, mutate: mutatePrograms } = usePrograms();
  const {
    error: enrollmentError,
    isLoading: isLoadingEnrollment,
    enrollments,
    mutate: mutateEnrollments,
  } = usePatientEnrolledPrograms(patientUuid);
  const {
    isLoading: isLoadingEligiblePrograms,
    mutateEligiblePrograms,
    carePrograms: eligibleProgram,
  } = useCarePrograms(patientUuid);

  const unenrolledPrograms = useMemo(() => {
    return programs.filter(
      (program) => enrollments.findIndex((enrollment) => enrollment.program.uuid === program.uuid) === -1,
    );
  }, [programs, enrollments]);

  const unenrolledEligiblePrograms = useMemo(() => {
    const programId = eligibleProgram
      .filter((program) => enrollments.findIndex((enrollment) => enrollment.program.uuid === program.uuid) === -1)
      .map((p) => p.uuid);
    return programs.filter((p) => programId.includes(p.uuid));
  }, [eligibleProgram, enrollments, programs]);

  return {
    isLoading: isLoadingEnrollment || isLoadingPrograms || isLoadingEligiblePrograms,
    error: programsError ?? enrollmentError,
    allPrograms: programs,
    enrolledPrograms: enrollments,
    eligiblePrograms: eligibleProgram,
    unenrolledPrograms,
    unenrolledEligiblePrograms,
    mutate: () => {
      mutateEnrollments();
      mutatePrograms();
      mutateEligiblePrograms();
    },
  };
};
