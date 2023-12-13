import useSWR, { mutate } from 'swr';
import { OpenmrsEncounter } from '../types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { ConfigObject, configSchema } from '../config-schema';
import groupBy from 'lodash/groupBy';

export const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),' +
  'names:(uuid,conceptNameType,name))),form:(uuid,name))';
export const defaulterTracingEncounterUuid = '1495edf8-2df2-11e9-b210-d663bd873d93';
export function usePatientTracing(patientUuid: string, encounterType: string) {
  const config = useConfig() as ConfigObject;
  const url = `/ws/rest/v1/encounter?encounterType=${config.defaulterTracingEncounterUuid}&patient=${patientUuid}&v=${encounterRepresentation}`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: OpenmrsEncounter[] } }, Error>(
    url,
    openmrsFetch,
  );
  // eslint-disable-next-line no-console
  console.log('response', data);
  //   const { chege } = usePatientTracing('patientuuid', 'encounteryTypeUuid');

  return {
    encounters: data?.data ? data?.data?.results : [],
    isLoading,
    isValidating,
    error,
    // onFormSave
  };
}
