import useSWR from 'swr';
import { OpenmrsEncounter } from '../types';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { encounterRepresentation, MissedAppointmentDate_UUID } from '../utils/constants';
import groupBy from 'lodash-es/groupBy';

export const defaulterTracingEncounterUuid = '1495edf8-2df2-11e9-b210-d663bd873d93';

export function usePatientTracing(patientUuid: string, encounterType: string) {
  const config = useConfig() as ConfigObject;
  const url = `/ws/rest/v1/encounter?encounterType=${config.defaulterTracingEncounterUuid}&patient=${patientUuid}&v=${encounterRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: OpenmrsEncounter[] } }, Error>(
    url,
    openmrsFetch,
  );

  return {
    encounters: data?.data ? data?.data?.results : [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
