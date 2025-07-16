import useSWR from 'swr';
import { type ConceptResponse } from '../../types';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export const useConcept = (conceptUuid: string) => {
  const apiUrl = `${restBaseUrl}/concept/${conceptUuid}`;

  const { data, error, isLoading } = useSWR<{ data: ConceptResponse }, Error>(
    conceptUuid ? apiUrl : null,
    openmrsFetch,
  );

  return {
    concept: data?.data || null,
    error: error,
    isLoading: isLoading,
  };
};
