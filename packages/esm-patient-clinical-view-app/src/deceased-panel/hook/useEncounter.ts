import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import groupBy from 'lodash-es/groupBy';
import { OpenmrsEncounter } from '../../types';
import { ConfigObject } from '../../config-schema';

export function useAutospyEncounter(patientUuid: string, encounterType: string) {
  const encounterRepresentation =
    'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
    'patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name)),' +
    'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),' +
    'names:(uuid,conceptNameType,name))),form:(uuid,name),' +
    'visit:(visitType:(uuid,display)))';

  const url = `/ws/rest/v1/encounter?encounterType=${encounterType}&patient=${patientUuid}&v=${encounterRepresentation}`;

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
