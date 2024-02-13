import useSWR from 'swr';
import { OpenmrsEncounter } from '../types';
import { openmrsFetch } from '@openmrs/esm-framework';
import { clinicalEncounterRepresentation } from '../utils/constants';
import sortBy from 'lodash/sortBy';
export function useClinicalEncounter(
  encounterTypeUuid: string,
  formUuid: string,
  patientUuid: string,
  conceptUuid: string[],
) {
  const url = `/ws/rest/v1/encounter?s=byEncounterForms&formUuid=${formUuid}&patient=${patientUuid}&encounterType=${encounterTypeUuid}&conceptUuid=${conceptUuid.toString()}&v=${clinicalEncounterRepresentation}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: OpenmrsEncounter[] } }, Error>(
    url,
    openmrsFetch,
  );
  const sortedClinicalEncounter = sortBy(data?.data?.results, 'encounterDatetime').reverse();
  return {
    encounters: sortedClinicalEncounter,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
