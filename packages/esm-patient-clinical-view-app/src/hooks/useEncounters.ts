import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Encounter } from '../types';
import pickBy from 'lodash/pickBy';

const useEncounters = (patientUuid: string, encounterTypeUuid: string, fromdate?: string, todate?: string) => {
  const customeRepresntation = 'custom:(uuid,display,encounterDatetime,obs:(uuid,display,value:(uuid,display)))';

  const params = new URLSearchParams(
    pickBy(
      { patient: patientUuid, encounterType: encounterTypeUuid, v: customeRepresntation, fromdate, todate },
      (value, key) => value,
    ),
  );

  const url = `${restBaseUrl}/encounter?${params.toString()}`;

  const { data, isLoading, error, mutate } = useSWR<FetchResponse<{ results: Array<Encounter> }>>(url, openmrsFetch);
  return {
    encounters: data?.data?.results ?? [],
    isLoading,
    error,
    mutate,
  };
};

export default useEncounters;
