import useSWR from 'swr';
import { Encounter, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { Observation } from '../types/encounter';
import { useMemo } from 'react';
import { ExpressWorkflowConfig } from '../config-schema';

type UsePatientEncounterResult = {
  encounters: Array<Encounter>;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
};

export const usePatientEncounter = (patientUuid: string, encounterTypeUuid: string): UsePatientEncounterResult => {
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<Encounter> } }>(
    `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${encounterTypeUuid}&v=full`,
    openmrsFetch,
  );
  return { encounters: data?.data?.results ?? [], isLoading, error, mutate };
};

export const extractValueFromObs = (obs: Observation): string => {
  if (!obs.value) {
    return '';
  }

  // Handle coded values (OpenmrsResource with display property)
  if (typeof obs.value === 'object' && 'display' in obs.value) {
    return obs.value.display;
  }

  // Handle numeric values
  if (typeof obs.value === 'number') {
    return obs.value.toString();
  }

  // Handle text/string values
  if (typeof obs.value === 'string') {
    return obs.value;
  }

  return null;
};

export const useClinicalEncounterForm = () => {
  const { clinicalEncounter } = useConfig<ExpressWorkflowConfig>();
  const url = `/ws/rest/v1/o3/forms/${clinicalEncounter.formUuid}`;
  const { data, isLoading, error, mutate } = useSWR<{ data }>(url, openmrsFetch);

  const conceptLabelMap = useMemo(() => {
    if (!data?.data) {
      return {};
    }

    const form = data.data;
    const conceptMapBySection = {};

    // Helper function to extract concepts from questions recursively
    const extractConceptsFromQuestions = (questions, sectionConceptMap) => {
      if (!Array.isArray(questions)) {
        return;
      }

      questions.forEach((question) => {
        // Extract concept from questionOptions.concept and use question.label
        if (question.questionOptions?.concept && question.label) {
          const conceptUuid = question.questionOptions.concept;
          sectionConceptMap[conceptUuid] = question.label;
        }

        // Extract concepts from answers and use answer.label
        if (question.questionOptions?.answers) {
          question.questionOptions.answers.forEach((answer) => {
            if (answer.concept && answer.label) {
              sectionConceptMap[answer.concept] = answer.label;
            }
          });
        }

        // Recursively process nested questions (for obsGroup questions)
        if (question.questions) {
          extractConceptsFromQuestions(question.questions, sectionConceptMap);
        }
      });
    };

    // Process all pages and sections, grouping by page label
    if (form.pages) {
      form.pages.forEach((page) => {
        const pageLabel = page.label;

        // Initialize concept map for this page
        if (!conceptMapBySection[pageLabel]) {
          conceptMapBySection[pageLabel] = {};
        }

        if (page.sections) {
          page.sections.forEach((section) => {
            if (section.questions) {
              extractConceptsFromQuestions(section.questions, conceptMapBySection[pageLabel]);
            }
          });
        }
      });
    }

    return conceptMapBySection;
  }, [data?.data]);

  return { form: data?.data, conceptLabelMap, isLoading, error, mutate };
};
