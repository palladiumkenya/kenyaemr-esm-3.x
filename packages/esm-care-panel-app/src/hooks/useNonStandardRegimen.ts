import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface nonStandardRegimen {
  name: string;
  uuid: string;
}

export const useNonStandardRegimen = () => {
  const nonStandardRegimenUrl = `/ws/rest/v1/kenyaemr/arvDrugs`;
  const { data, mutate, error, isLoading } = useSWR<{ data: { results: Array<nonStandardRegimen> } }>(
    nonStandardRegimenUrl,
    openmrsFetch,
  );

  const nonStandardRegimen = data?.data?.results ? data?.data?.results : [];
  return { nonStandardRegimen, isLoading, error };
};
