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

const programForms: Array<{
  programName: string;
  programUuid: string;
  forms: {
    formName: string;
    formUuId: string;
    dependancies: string[];
  }[];
}> = [
  {
    programName: 'PNC',
    programUuid: '286598d5-1886-4f0d-9e5f-fa5473399cee',
    forms: [
      { formName: 'MCH Postnatal Visit Form', formUuId: '72aa78e0-ee4b-47c3-9073-26f3b9ecc4a7', dependancies: [] },
      { formName: 'PNC Services Discontinuation', formUuId: '30db888b-d6d3-47fb-b0c9-dbdf10a57ff5', dependancies: [] },
    ],
  },
  {
    programName: 'ANC',
    programUuid: '72635673-0613-4259-916e-e0d5d5ef8f66',
    forms: [
      { formName: 'ANC Follow Up form', formUuId: '6fb1a39b-0a57-4239-afd7-a5490d281cb9', dependancies: [] },
      { formName: 'MCH Antenatal Visit', formUuId: 'e8f98494-af35-4bb8-9fc7-c409c8fed843', dependancies: [] },
      {
        formName: 'Antenatal Care (ANC) Discontinuation',
        formUuId: '38885518-c71a-4661-8edf-3db67707e1d1',
        dependancies: [],
      },
    ],
  },
  {
    programName: 'MCH - Child Services', // cwc
    programUuid: 'c2ecdf11-97cd-432a-a971-cfd9bd296b83',
    forms: [
      { formName: 'Child welfare clinic form', formUuId: '755b59e6-acbb-4853-abaf-be302039f902', dependancies: [] }, // CWC followup
      { formName: 'MCH Postnatal Visit Form', formUuId: '72aa78e0-ee4b-47c3-9073-26f3b9ecc4a7', dependancies: [] },
      {
        formName: 'Child Welfare Services Discontinuation',
        formUuId: '1dd02c43-904b-4206-8378-7b1a8414c326',
        dependancies: [],
      },
    ],
  },
  {
    programName: 'Nutrition',
    programUuid: '504f179b-4a13-4790-9ecd-ca4963448af8',
    forms: [
      { formName: 'Nutrition form', formUuId: 'b8357314-0f6a-4fc9-a5b7-339f47095d62', dependancies: [] },
      {
        formName: 'Nutrition Services Discontinuation',
        formUuId: '0648a046-f404-4246-806f-c9ee78232d6d',
        dependancies: [],
      },
    ],
  },
  {
    programName: 'Family Planning',
    programUuid: '191269d2-9973-4958-9936-f687ed771050',
    forms: [
      { formName: 'Family Planning Form', formUuId: 'a52c57d4-110f-4879-82ae-907b0d90add6', dependancies: [] },
      {
        formName: 'Family Planning Discontinuation',
        formUuId: 'efc782ea-9a16-4791-824a-18be7417eda4',
        dependancies: [],
      },
    ],
  },
  {
    programName: 'TB',
    programUuid: '9f144a34-3a4a-44a9-8486-6b7af6cc64f6',
    forms: [
      { formName: 'TB Enrollment', formUuId: '89994550-9939-40f3-afa6-173bce445c79', dependancies: [] },
      {
        formName: 'TB FollowUp',
        formUuId: '2daabb77-7ad6-4952-864b-8d23e109c69d',
        dependancies: ['89994550-9939-40f3-afa6-173bce445c79'],
      },
      {
        formName: 'TB Discontinuation',
        formUuId: '4b296dd0-f6be-4007-9eb8-d0fd4e94fb3a',
        dependancies: ['89994550-9939-40f3-afa6-173bce445c79'],
      },
    ],
  },
  {
    programName: 'Violence screening',
    programUuid: 'e41c3d74-37c7-4001-9f19-ef9e35224b70',
    forms: [
      { formName: 'Violence enrollment', formUuId: '9ba1d4aa-57d7-48f9-a635-a23508e8136c', dependancies: [] },
      {
        formName: 'Violence Screening',
        formUuId: '03767614-1384-4ce3-aea9-27e2f4e67d01',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
      {
        formName: 'Violence Reporting Form',
        formUuId: '10cd2ca0-8d25-4876-b97c-b568a912957e',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
      {
        formName: 'Violence Consent Form',
        formUuId: 'd720a8b3-52cc-41e2-9a75-3fd0d67744e5',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
      {
        formName: 'Sexual Violence post rape care 363A',
        formUuId: 'c46aa4fd-8a5a-4675-90a7-a6f2119f61d8',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      }, // PRC Form Part A
      {
        formName: 'Sexual Violence PRC Psychological Assessment 363B',
        formUuId: '9d21275a-7657-433a-b305-a736423cc496',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      }, // PRC Form Part B
      {
        formName: 'Physical and Emotional Violence Form',
        formUuId: 'a0943862-f0fe-483d-9f11-44f62abae063',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
      {
        formName: 'Violence Trauma Counselling',
        formUuId: 'e983d758-5adf-4917-8172-0f4be4d8116a',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
      {
        formName: 'Violence Community Linkage Form',
        formUuId: 'f760e38c-3d2f-4a5d-aa3d-e9682576efa8',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
      {
        formName: 'Violence Legal Form',
        formUuId: 'd0c36426-4503-4236-ab5d-39bff77f2b50',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
      {
        formName: 'Violence Perpetrator Details',
        formUuId: 'f37d7e0e-95e8-430d-96a3-8e22664f74d6',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
      {
        formName: 'PEP FOLLOWUP Form',
        formUuId: '155ccbe2-a33f-4a58-8ce6-57a7372071ee',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
      {
        formName: 'Violence Discontinuation Form',
        formUuId: '8fed3d06-f8a1-4cb8-b853-cd93394bab79',
        dependancies: ['9ba1d4aa-57d7-48f9-a635-a23508e8136c'],
      },
    ],
  },
  {
    programName: 'TPT',
    programUuid: '335517a1-04bc-438b-9843-1ba49fb7fcd9',
    forms: [
      { formName: 'TPT Initiation', formUuId: '61ea2a72-b0f9-47cf-ae86-443f88656acc', dependancies: [] },
      {
        formName: 'TPT FollowUp',
        formUuId: '9d0e4be8-ab72-4394-8df7-b509b9d45179',
        dependancies: ['61ea2a72-b0f9-47cf-ae86-443f88656acc'],
      },
      {
        formName: 'TPT Outcome/Discontinuation',
        formUuId: '5bdd3b65-8b7b-46a0-9f7b-dfe764143848',
        dependancies: ['61ea2a72-b0f9-47cf-ae86-443f88656acc'],
      },
    ],
  },
  {
    programName: 'PrEP',
    programUuid: '214cad1c-bb62-4d8e-b927-810a046daf62',
    forms: [
      { formName: 'PrEP Initial Form', formUuId: '1bfb09fc-56d7-4108-bd59-b2765fd312b8', dependancies: [] },
      {
        formName: 'PrEP INITIATION',
        formUuId: 'd5ca78be-654e-4d23-836e-a934739be555',
        dependancies: ['1bfb09fc-56d7-4108-bd59-b2765fd312b8'],
      },
      {
        formName: 'PrEP Follow Up',
        formUuId: 'ee3e2017-52c0-4a54-99ab-ebb542fb8984',
        dependancies: ['1bfb09fc-56d7-4108-bd59-b2765fd312b8'],
      },
      {
        formName: 'PrEP Monthly Refill Form',
        formUuId: '291c03c8-a216-11e9-a2a3-2a2ae2dbcce4',
        dependancies: ['1bfb09fc-56d7-4108-bd59-b2765fd312b8'],
      },
    ],
  },
  {
    programName: 'NCD',
    programUuid: 'ffee43c4-9ccd-4e55-8a70-93194e7fafc6',
    forms: [
      { formName: 'NCD Initial Form', formUuId: 'c4994dd7-f2b6-4c28-bdc7-8b1d9d2a6a97', dependancies: [] },
      {
        formName: 'NCD Follow Up',
        formUuId: '3e1057da-f130-44d9-b2bb-53e039b953c6',
        dependancies: ['c4994dd7-f2b6-4c28-bdc7-8b1d9d2a6a97'],
      },
      {
        formName: 'NCD Discontinuation',
        formUuId: '63182d28-a23f-4d14-b48e-38077bbd8ed2',
        dependancies: ['c4994dd7-f2b6-4c28-bdc7-8b1d9d2a6a97'],
      },
    ],
  },
  {
    programName: 'KVP',
    programUuid: '7447305a-18a7-11e9-ab14-d663bd873d93',
    forms: [
      { formName: 'KVP Contact Form', formUuId: '185dec84-df6f-4fc7-a370-15aa8be531ec', dependancies: [] },
      { formName: 'KVP Clinical Enrollment', formUuId: 'c7f47cea-207b-11e9-ab14-d663bd873d93', dependancies: [] },
      { formName: 'KVP Clinical Encounter form', formUuId: '92e041ac-9686-11e9-bc42-526af7764f64', dependancies: [] },
      { formName: 'KVP Client Discontinuation', formUuId: '1f76643e-2495-11e9-ab14-d663bd873d93', dependancies: [] },
    ],
  },
  {
    programName: 'HIV Program',
    programUuid: 'dfdc6d40-2f2f-463d-ba90-cc97350441a8',
    forms: [
      { formName: 'HIV Enrollment', formUuId: 'e4b506c1-7379-42b6-a374-284469cba8da', dependancies: [] },
      {
        formName: 'ART Readyness',
        formUuId: '782a4263-3ac9-4ce8-b316-534571233f12',
        dependancies: ['e4b506c1-7379-42b6-a374-284469cba8da'],
      }, // USING ART prepairation form (closest to readiness)
      {
        formName: 'HIV Green Card',
        formUuId: '22c68f86-bbf0-49ba-b2d1-23fa7ccf0259',
        dependancies: ['e4b506c1-7379-42b6-a374-284469cba8da'],
      },
      {
        formName: 'HIV Discontinuation',
        formUuId: 'e3237ede-fa70-451f-9e6c-0908bc39f8b9',
        dependancies: ['e4b506c1-7379-42b6-a374-284469cba8da'],
      },
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
  {
    programName: 'Medical Assited therapy',
    programUuid: '4b898e20-9b2d-11ee-b9d1-0242ac120002',
    forms: [
      { formName: 'MAT Initial Registration Form', formUuId: '9a9cadd7-fba1-4a24-94aa-43edfbecf8d9', dependancies: [] },
      {
        formName: 'MAT Clinical Encounter Form',
        formUuId: '5ed937a0-0933-41c3-b638-63d8a4779845',
        dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
      },
      {
        formName: 'MAT Psycho-social Intake & Follow-up Form',
        formUuId: 'cfd2109b-63b3-43de-8bb3-682e80c5a965',
        dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
      },
      {
        formName: 'MAT Psychiatric Intake and Follow up Form',
        formUuId: 'fdea46a1-9423-4ef9-b780-93b32b48a528',
        dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
      },
      {
        formName: 'MAT Transit/Referral Form',
        formUuId: 'b9495048-eceb-4dd2-bfba-330dc4900ee9',
        dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
      },
      {
        formName: 'MAT Cessation Form',
        formUuId: 'fa58cbc1-91c8-4920-813b-fde7fd69533b',
        dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
      },
      {
        formName: 'MAT Discontinuation Form',
        formUuId: '38d6e116-b96c-4916-a821-b4dc83e2041d',
        dependancies: ['9a9cadd7-fba1-4a24-94aa-43edfbecf8d9'],
      },
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
