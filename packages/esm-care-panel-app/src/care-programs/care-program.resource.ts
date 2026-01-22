import {
  FetchResponse,
  launchWorkspace,
  openmrsFetch,
  parseDate,
  restBaseUrl,
  showModal,
  useConfig,
  Visit,
} from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR, { mutate } from 'swr';
import z from 'zod';
import { CarePanelConfig } from '../config-schema';
import { useMemo } from 'react';

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
  const { excludedCarePrograms } = useConfig<CarePanelConfig>();
  const url = `${restBaseUrl}/programenrollment?patient=${patientUuid}&v=${customRepresentation}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: Array<Enrollement> }>>(url, openmrsFetch);
  const enrollments = useMemo(() => {
    const allEnrollments = data?.data?.results ?? [];
    return allEnrollments.filter(
      (enrollment) => !excludedCarePrograms.includes(enrollment.program.uuid) && !enrollment.dateCompleted,
    );
  }, [data, excludedCarePrograms]);
  return {
    isLoading,
    error,
    enrollments,
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

type FormEncounter = {
  encounter: {
    encounterDatetime: string;
    uuid: string;
    id: number;
    encounterType: string;
    dateCreated: string;
  };
  form: {
    uuid: string;
    name: string;
  };
};

type UsePatientFormEncountersOptions = { scope: 'all-visits' } | { scope: 'current-visit'; currentVisit?: Visit };

export const usePatientFormEncounter = (
  patientUuid: string,
  formUuid: string,
  options: UsePatientFormEncountersOptions = { scope: 'all-visits' },
) => {
  const url = `${restBaseUrl}/kenyaemr/encountersByPatientAndForm?patientUuid=${patientUuid}&formUuid=${formUuid}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: Array<FormEncounter> }>>(
    options?.scope === 'current-visit' ? null : url,
    openmrsFetch,
  );
  const formEncounters = useMemo(() => {
    if (options.scope !== 'all-visits') {
      return [];
    }
    return (data?.data?.results ?? [])
      .map((data) => ({
        ...data,
        encounter: {
          ...data.encounter,
          encounterDatetime: parseDate(data.encounter.encounterDatetime),
        },
      }))
      .sort((a, b) => dayjs(b.encounter.encounterDatetime).diff(dayjs(a.encounter.encounterDatetime)));
  }, [data, options]);
  const formEncountersInCurrentVisit = useMemo(() => {
    if (options.scope !== 'current-visit') {
      return [];
    }
    return (options.currentVisit?.encounters ?? [])
      .filter((encounter) => encounter.form?.uuid === formUuid)
      .map((encounter) => ({
        encounter: {
          encounterDatetime: parseDate(encounter.encounterDatetime),
          uuid: encounter.uuid!,
          id: encounter.id!,
          encounterType: encounter.encounterType!.uuid,
          dateCreated: encounter.dateCreated!,
        },
        form: {
          uuid: encounter.form!.uuid,
          name: encounter.form!.name,
        },
      }))
      .sort((a, b) => dayjs(b.encounter.encounterDatetime).diff(dayjs(a.encounter.encounterDatetime)));
  }, [options, formUuid]);

  return {
    formEncounters: options.scope === 'all-visits' ? formEncounters : formEncountersInCurrentVisit,
    error,
    isLoading,
    mutate,
  };
};

export const useFormsFilled = (patientUuid: string, formUuids: Array<string> = []) => {
  const shouldFetch = patientUuid && formUuids.length > 0;

  const { data, error, mutate, isLoading } = useSWR<boolean>(
    shouldFetch ? ['forms-filled', patientUuid, formUuids] : null,
    async () => {
      const tasks = await Promise.allSettled(
        formUuids.map((formUuid) =>
          openmrsFetch<{ results: Array<FormEncounter> }>(
            `${restBaseUrl}/kenyaemr/encountersByPatientAndForm?patientUuid=${patientUuid}&formUuid=${formUuid}`,
          ),
        ),
      );

      // true only if ALL forms have at least one encounter
      return tasks.every((task) => task.status === 'fulfilled' && task.value.data?.results?.length > 0);
    },
  );

  return {
    formsFilled: data ?? false,
    isLoading,
    mutate,
    error,
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
