import { FetchResponse, openmrsFetch, restBaseUrl, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { DefaultFacility, SHAFacility } from '../../types';

export function useShaFacilityInfo(shouldSynchronize: boolean = false) {
  const { authenticated } = useSession();
  const url = `${restBaseUrl}/kenyaemr/sha-facility-status?synchronize=${shouldSynchronize}`;

  const { data, isLoading, error, mutate } = useSWR<FetchResponse<SHAFacility>>(
    authenticated ? url : null,
    openmrsFetch,
  );

  return {
    isLoading,
    shaFacility: data?.data,
    error,
    mutate,
  };
}

export const useLocalFacilityInfo = () => {
  const url = `${restBaseUrl}/kenyaemr/default-facility`;
  const { authenticated } = useSession();

  const { data, isLoading, error, mutate } = useSWR<FetchResponse<DefaultFacility>>(
    authenticated ? url : null,
    openmrsFetch,
  );

  return {
    isLoading,
    localFacility: data?.data,
    error,
    mutate,
  };
};
