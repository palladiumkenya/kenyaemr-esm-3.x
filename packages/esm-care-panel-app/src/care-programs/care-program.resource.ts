import { FetchResponse, launchWorkspace, openmrsFetch, restBaseUrl, showModal } from '@openmrs/esm-framework';
import useSWR, { mutate } from 'swr';
import z from 'zod';

export interface Enrollement {
  uuid: string;
  display: string;
  program: Program;
  dateEnrolled: string;
  dateCompleted?: string;
  location: Location;
  states: Array<ProgramWorkflowState>;
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

export interface ProgramWorkflowState {
  state: {
    uuid: string;
    concept: Concept;
  };
  startDate: string;
  endDate: string;
  voided: boolean;
}

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
    programName: 'ANC',
    programUuid: '72635673-0613-4259-916e-e0d5d5ef8f66',
    forms: [
      { formName: 'ANC Follow Up form', formUuId: '6fb1a39b-0a57-4239-afd7-a5490d281cb9' },
      { formName: 'Antenatal Care (ANC) Discontinuation', formUuId: '38885518-c71a-4661-8edf-3db67707e1d1' },
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
  // { // TODO Uncomment and add conrect uuids after program is added by the BA
  //   programName: 'Pre-Conception care program',
  //   programUuid: '191269d2-9973-4958-9936-f687ed771050',
  //   forms: [
  //     { formName: 'Family Planning Form', formUuId: 'a52c57d4-110f-4879-82ae-907b0d90add6' },
  //     { formName: 'Family Planning Discontinuation', formUuId: 'efc782ea-9a16-4791-824a-18be7417eda4' },
  //   ],
  // },
];

export const getProgramForms = (programUuid: string) => {
  const program = programForms.find((p) => p.programUuid === programUuid);
  if (!program) {
    return [];
  }
  return program.forms;
};

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
  const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display),states:(startDate,endDate,voided,state:(uuid,concept:(display))))`;

  const url = `${restBaseUrl}/programenrollment?patient=${patientUuid}&v=${customRepresentation}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: Array<Enrollement> }>>(url, openmrsFetch);
  return {
    isLoading,
    error,
    enrollments: data?.data?.results ?? [],
    mutate,
  };
};

export const useProgramDetail = (programId: string) => {
  const rep = 'custom:(uuid,display,name,allWorkflows,concept:(uuid,display))';
  const url = `${restBaseUrl}/program/${programId}?v=${rep}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<Program>>(url, openmrsFetch);
  return {
    isLoading,
    error,
    program: data?.data,
    mutate,
  };
};

export const ProgramFormSchema = z.object({
  dateEnrolled: z.date({ coerce: true }),
  dateCompleted: z.date({ coerce: true }).optional(),
  location: z.string().nonempty(),
});

export type ProgramFormData = z.infer<typeof ProgramFormSchema>;

export const mutateEnrollments = (patientUuid: string) =>
  mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/programenrollment?patient=${patientUuid}`));

export function createProgramEnrollment(
  program: Program,
  patientUuid: string,
  payload: ProgramFormData,
  abortController: AbortController,
) {
  const { dateEnrolled, dateCompleted, location } = payload;
  return openmrsFetch(`${restBaseUrl}/programenrollment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { program, patient: patientUuid, dateEnrolled, dateCompleted, location },
    signal: abortController.signal,
  });
}

export function updateProgramEnrollment(
  programEnrollmentUuid: string,
  payload: ProgramFormData,
  abortController: AbortController,
) {
  const { dateEnrolled, dateCompleted, location } = payload;
  return openmrsFetch(`${restBaseUrl}/programenrollment/${programEnrollmentUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { dateEnrolled, dateCompleted, location },
    signal: abortController.signal,
  });
}

export const findLastState = (states: ProgramWorkflowState[]): ProgramWorkflowState => {
  const activeStates = states.filter((state) => !state.voided);
  const ongoingState = activeStates.find((state) => !state.endDate);

  if (ongoingState) {
    return ongoingState;
  }

  return activeStates.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
};

export const launchDeleteProgramDialog = (programEnrollmentId: string, patientUuid: string) => {
  const dispose = showModal('program-delete-confirmation-modal', {
    closeDeleteModal: () => dispose(),
    programEnrollmentId,
    patientUuid,
    size: 'sm',
  });
};

export const launchProgramForm = (
  programUuid: string,
  patientUuid: string,
  enrollment: Enrollement | undefined,
  onSuccess?: () => void,
) => {
  launchWorkspace('mch-program-form-workspace', {
    enrollment,
    patientUuid,
    programUuid,
    onSubmitSuccess: onSuccess,
  });
};
