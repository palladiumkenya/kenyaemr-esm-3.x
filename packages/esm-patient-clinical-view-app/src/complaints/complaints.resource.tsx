import useSWR from 'swr';
import { useMemo } from 'react';
import {
  Encounter,
  makeUrl,
  openmrsFetch,
  restBaseUrl,
  useOpenmrsPagination,
  formatDate,
  parseDate,
} from '@openmrs/esm-framework';

export function usePaginatedEncounters(patientUuid: string, encounterType: string, pageSize: number) {
  const customRep = `custom:(uuid,display,diagnoses:(uuid,display,rank,diagnosis,certainty,voided),encounterDatetime,form:(uuid,display,name,description,encounterType,version,resources:(uuid,display,name,valueReference)),encounterType,visit,patient,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterProviders:(provider:(person)))`;
  const url = new URL(makeUrl(`${restBaseUrl}/encounter`), window.location.toString());
  url.searchParams.set('patient', patientUuid);
  url.searchParams.set('v', customRep);
  url.searchParams.set('order', 'desc');
  encounterType && url.searchParams.set('encounterType', encounterType);
  return useOpenmrsPagination<Encounter>(patientUuid ? url : null, pageSize);
}

const extractConceptLabels = (questions = []): Record<string, string> => {
  const map: Record<string, string> = {};

  questions.forEach((question) => {
    // Extract labels from answers in questionOptions
    if (question.questionOptions?.answers) {
      question.questionOptions.answers.forEach((answer) => {
        map[answer.concept] = answer.label;
      });
    }

    // Recursively process nested questions (for obsGroup questions)
    if (question.questions) {
      Object.assign(map, extractConceptLabels(question.questions));
    }
  });

  return map;
};

export const useForm = (formUuid: string) => {
  const url = `${restBaseUrl}/o3/forms/${formUuid}`;
  const { data, isLoading, error, mutate } = useSWR<{ data: Record<string, any> }>(url, openmrsFetch);

  const conceptLabelMap = useMemo(() => {
    if (!data?.data?.pages) {
      return {};
    }

    const map: Record<string, string> = {};

    // Traverse pages -> sections -> questions
    data.data.pages.forEach((page) => {
      page.sections?.forEach((section) => {
        if (section.questions) {
          Object.assign(map, extractConceptLabels(section.questions));
        }
      });
    });

    return map;
  }, [data]);

  return { data, isLoading, error, mutate, conceptLabelMap };
};

export const extractComplaintsFromObservations = (
  observations: any[],
  config: {
    complaints: {
      chiefComplaintConceptUuid: string;
      complaintMemberConceptUuid: string;
      durationConceptUuid: string;
      onsetConceptUuid: string;
    };
  },
  conceptLabelMap: Record<string, string>,
) => {
  return observations
    .flatMap((observation) => observation)
    .filter((obs) => obs.concept.uuid === config.complaints.chiefComplaintConceptUuid)
    .map((obs) => {
      const complaintMember = obs.groupMembers?.find(
        (member) => member.concept.uuid === config.complaints.complaintMemberConceptUuid,
      );
      const durationMember = obs.groupMembers?.find(
        (member) => member.concept.uuid === config.complaints.durationConceptUuid,
      );
      const onsetMember = obs.groupMembers?.find(
        (member) => member.concept.uuid === config.complaints.onsetConceptUuid,
      );
      const onsetValue =
        typeof onsetMember?.value === 'object' ? conceptLabelMap[onsetMember?.value?.['uuid']] : onsetMember?.value;
      const onsetDate = obs.obsDatetime ? formatDate(parseDate(obs.obsDatetime), { mode: 'wide', noToday: true }) : '';
      const onsetDisplay = [onsetDate, onsetValue].filter(Boolean).join(' - ') || '--';

      return {
        id: obs.uuid,
        complaint:
          (typeof complaintMember?.value === 'object' && complaintMember?.value?.display) ||
          complaintMember?.display ||
          '--',
        duration: durationMember?.value || '--',
        onset: onsetDisplay,
      };
    });
};
