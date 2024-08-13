import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ActiveRequest } from '../types';

const useActiveRequests = (labManifestUuid: string) => {
  const url = `${restBaseUrl}/kemrorder/validorders?manifestUuid=${labManifestUuid}`;
  const { isLoading, error, data } = useSWR<FetchResponse<ActiveRequest>>(url, openmrsFetch);

  return {
    isLoading,
    request: data?.data,
    error,
  };
};

export default useActiveRequests;
