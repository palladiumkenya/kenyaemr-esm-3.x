import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { RegimenEncounter } from '../types';

export const useRegimenEncounter = (category: string, patientUuid: string) => {
  const regimenEncounterUrl = `/ws/rest/v1/kenyaemr/lastRegimenEncounter?patientUuid=${patientUuid}&category=${category}`;
  const { data, mutate, error, isLoading } = useSWR<{ data: { results } }>(regimenEncounterUrl, openmrsFetch);

  const regimenEncounter = data?.data?.results ? data?.data?.results : '';
  return { regimenEncounter, isLoading, error };
};
