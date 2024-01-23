import useSWR from 'swr';
import { OpenmrsEncounter } from '../types';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { clinicalEncounterRepresentation } from '../../../utils/constants';
export const clinicalEncounterUuid = '1f230b7d-b79e-4e2d-9f19-0fa57cc6b215';

export function useClinicalEncounter(patientUuid: string, encounterType: string) {
  const config = useConfig() as ConfigObject;
  const url = `/ws/rest/v1/encounter?encounterType=${config.clinicalEncounterUuid}&patient=${patientUuid}&v=${clinicalEncounterRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: OpenmrsEncounter[] } }, Error>(
    url,
    openmrsFetch,
  );
  const clinicalEncounter = data?.data?.results?.filter(
    (enc) => enc.form.uuid === 'e958f902-64df-4819-afd4-7fb061f59308',
  );

  return {
    encounters: clinicalEncounter,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
