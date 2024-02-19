import useSWR from 'swr';
import { OpenmrsEncounter } from '../types';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { DeliveryForm_UUID, MchEncounterType_UUID, encounterRepresentation } from '../utils/constants';

export function useNeonatalSummary(patientUuid: string, encounterType: string) {
  const config = useConfig() as ConfigObject;
  const url = `/ws/rest/v1/encounter?encounterType=${MchEncounterType_UUID}&patient=${patientUuid}&v=${encounterRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: OpenmrsEncounter[] } }, Error>(
    url,
    openmrsFetch,
  );

  const neonatalEncounter = data?.data?.results?.filter((enc) => enc.form.uuid === DeliveryForm_UUID);

  return {
    encounters: data?.data ? neonatalEncounter : [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
