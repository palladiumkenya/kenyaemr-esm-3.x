import { openmrsFetch, useConfig, restBaseUrl, FetchResponse } from '@openmrs/esm-framework';
import { OpenmrsEncounter, Visit } from '../types';
import useSWR from 'swr';
import { ConfigObject } from '../config-schema';

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

export const useActiveMorgueVisit = (uuid: string) => {
  const { morgueVisitTypeUuid } = useConfig<ConfigObject>();
  const url = `${restBaseUrl}/visit?v=full&includeInactive=false&totalCount=true&visitType=${morgueVisitTypeUuid}&q=${uuid}`;

  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Visit[] }>>(url, openmrsFetch);

  return { activeVisit: data?.data?.results[0], error, isLoading };
};

export const usePatientDischargedStatus = (uuid: string) => {
  const customRepresentation = 'custom:(visitType:(uuid),startDatetime,stopDatetime,encounters:(encounterType:(uuid)))';
  const url = `${restBaseUrl}/visit?v=${customRepresentation}&patient=${uuid}&limit=1`;

  const { data, error, isLoading } = useSWR<
    FetchResponse<{
      results: Array<{
        visitType: { uuid: string };
        startDatetime: string;
        stopDatetime: string;
        encounters: Array<{
          encounterType: {
            uuid: string;
          };
        }>;
      }>;
    }>
  >(url, openmrsFetch);

  const status = data?.data?.results[0];

  return {
    status,
    error,
    isLoading,
  };
};
