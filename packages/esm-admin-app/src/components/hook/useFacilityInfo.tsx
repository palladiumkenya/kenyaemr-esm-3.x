import { FetchResponse, openmrsFetch, restBaseUrl, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { FacilityData } from '../../types';

export function useFacilityInfo(shouldSynchronize: boolean = false) {
  const { authenticated } = useSession();
  const url = `${restBaseUrl}/kenyaemr/default-facility?synchronize=${shouldSynchronize}`;

  const { data, isLoading, error, mutate } = useSWR<FetchResponse<FacilityData>>(
    authenticated ? url : null,
    openmrsFetch,
    {},
  );

  return {
    isLoading,
    defaultFacility: data?.data,
    error,
    refetch: mutate, // Expose mutate as refetch
  };
}
