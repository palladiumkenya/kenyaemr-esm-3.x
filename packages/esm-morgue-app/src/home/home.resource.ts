import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { MortuaryPatient } from '../typess';

interface MortuaryApiResponse {
  results: MortuaryPatient[];
}

export const useAwaitingQueuePatients = () => {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true`;
  const { isLoading, error, data, mutate } = useSWR<FetchResponse<MortuaryApiResponse>>(url, openmrsFetch);

  return {
    awaitingQueueDeceasedPatients: data?.data?.results || [],
    isLoadingAwaitingQueuePatients: isLoading,
    errorFetchingAwaitingQueuePatients: error,
    mutateAwaitingQueuePatients: mutate,
  };
};
