import { FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ConfigObject } from '../../config-schema';
import { Visit } from '../../types';

export const useActiveMorgueVisit = (uuid: string) => {
  const { morgueVisitTypeUuid } = useConfig<ConfigObject>();
  const customRepresentation = `custom:(uuid,display,startDatetime,stopDatetime)`;
  const url = `${restBaseUrl}/visit?v=${customRepresentation}&includeInactive=false&totalCount=true&visitType=${morgueVisitTypeUuid}&q=${uuid}`;

  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Visit[] }>>(url, openmrsFetch);

  return { activeVisit: data?.data?.results[0], error, isLoading };
};
