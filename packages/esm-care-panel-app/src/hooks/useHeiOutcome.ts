import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const useHeiOutcome = (patientUuid: string) => {
  const url = `/ws/rest/v1/kenyaemr/heiOutcomeEncounter?patientUuid=${patientUuid}`;
  const { data, mutate, error, isLoading } = useSWR<{ data }>(url, openmrsFetch);

  const heiOutcome = data?.data ? data?.data : {};
  return { heiOutcome, isLoading, error };
};
