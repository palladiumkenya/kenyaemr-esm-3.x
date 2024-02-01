import useSWR from 'swr';
import { OpenmrsEncounter } from '../types';
import { OpenmrsResource, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { encounterRepresentation, MissedAppointmentDate_UUID } from '../../../utils/constants';
import groupBy from 'lodash-es/groupBy';
import { partoGraphRepresentation } from '../esm-mch-app/constants';
export type PartogramProgram = {
  concept: OpenmrsResource;
  obsDatetime: string;
  value: string;
  status: string;
  uuid: string;
  display: string;
};
export function usePartograph(patientUuid: string) {
  const config = useConfig() as ConfigObject;
  const url = `/ws/rest/v1/encounter?s=byEncounterForms&encounterType=c6d09e05-1f25-4164-8860-9f32c5a02df0&formUuid=d4c4dcfa-5c7b-4727-a7a6-f79a3b2c2735&patient=${patientUuid}&v=${encounterRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: OpenmrsEncounter[] } }, Error>(
    url,
    openmrsFetch,
  );
  const results = data?.data ? data?.data?.results : [];
  const flattedObs = results
    .flatMap((encounter) => encounter.obs)
    .filter((obs) => obs?.concept?.uuid === '160116AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  return {
    encounters: flattedObs,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
