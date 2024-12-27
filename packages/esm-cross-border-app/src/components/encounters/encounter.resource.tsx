import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const useCrossBorderEncounter = () => {
  const url = `${restBaseUrl}/encounter?encounterType=Cross-Border`;
  const { data, error, isLoading } = useSWR(url, openmrsFetch);

  return {
    encounter: data,
    isLoading,
    error,
  };
};
