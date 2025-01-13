import { FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ConfigObject } from '../../config-schema';
import { Visit } from '../../types';

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
