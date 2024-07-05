import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';

export function useVisit(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,diagnoses:(uuid,display,certainty),encounterDatetime,encounterType:(uuid,display),encounterProviders:(uuid,display,provider:(uuid,person:(uuid,display)))),location:(uuid,name,display),visitType:(uuid,name,display),startDatetime,stopDatetime)&limit=1';

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    visits: data ? data?.data?.results[0] : null,
    error,
    isLoading,
    isValidating,
    mutateVisits: mutate,
  };
}
