import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface StandardRegimen {
  categoryCode: string;
  category: Array<RegimenCategory>;
}

interface RegimenCategory {
  regimenline: string;
  regimenLineValue: string;
  regimen: Array<Regimen>;
}

interface Regimen {
  name: string;
  conceptRef: string;
}

export const useStandardRegimen = () => {
  const standardRegimenUrl = `/ws/rest/v1/kenyaemr/standardRegimen`;
  const { data, mutate, error, isLoading } = useSWR<{ data: { results: Array<StandardRegimen> } }>(
    standardRegimenUrl,
    openmrsFetch,
  );

  const standardRegimen = data?.data?.results ? data?.data?.results : [];
  return { standardRegimen, isLoading, error };
};
