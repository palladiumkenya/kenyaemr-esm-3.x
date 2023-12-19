import useSWR from 'swr';
import { OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
const SESSSION_DETAILS_CONCEPT = '164891AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const ADHERENCE_ENCOUNTER_TYPE_UUID = '54df6991-13de-4efc-a1a9-2d5ac1b72ff8';

export type AdherenceProgram = {
  concept: OpenmrsResource;
  obsDatetime: string;
  value: string;
  status: string;
  uuid: string;
};
export const usePatientEnhancedAdherence = (patientUuid: string) => {
  const url = `/ws/rest/v1/encounter?patient=${patientUuid}&v=custom:(uuid,encounterDatetime,obs:(obsDatetime,value,concept:(uuid,display),status))&encounterType=${ADHERENCE_ENCOUNTER_TYPE_UUID}`;
  const { data, error, isLoading, isValidating } = useSWR<{
    data: { results: Array<{ uuid: string; obs: Array<AdherenceProgram>; encounterDatetime: string }> };
  }>(url, openmrsFetch);

  const responseData = data?.data?.results ?? [];
  const results = responseData.flatMap((el) => el.obs).filter((obs) => obs.concept.uuid === SESSSION_DETAILS_CONCEPT);

  const groupedEncounterResults: Record<string, Array<{ encounter: any }>> = {};

  responseData.forEach((encounter) => {
    const seriesStartDateObs = encounter.obs.filter((obs) => obs.concept.uuid === SESSSION_DETAILS_CONCEPT);
    let seriesStartDate = seriesStartDateObs[0]?.value ?? encounter.encounterDatetime;
    const key = seriesStartDate?.split('T')[0].trim() ?? encounter.encounterDatetime;

    if (!groupedEncounterResults[key]) {
      groupedEncounterResults[key] = [];
    }
    groupedEncounterResults[key].push({
      encounter: encounter,
    });
  });

  const groupedResults: Record<string, Array<{ obsDatetime: string; display: string }>> = {};

  results.forEach((obs) => {
    const key = obs.value.split('T')[0];
    if (!groupedResults[key]) {
      groupedResults[key] = [];
    }
    groupedResults[key].push({
      obsDatetime: obs.obsDatetime,
      display: obs.concept.display,
    });
  });

  return {
    patientAdherence: groupedEncounterResults,
    error,
    isLoading,
    isValidating,
  };
};
