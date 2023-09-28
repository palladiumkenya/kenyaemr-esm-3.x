import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface RegimenReason {
  category: string;
  reason: Array<Reason>;
}
interface Reason {
  label: string;
  value: string;
}

export const useRegimenReason = () => {
  const regimenReasonUrl = `/ws/rest/v1/kenyaemr/regimenReason`;
  const { data, mutate, error, isLoading } = useSWR<{ data: { results: Array<RegimenReason> } }>(
    regimenReasonUrl,
    openmrsFetch,
  );

  const regimenReason = data?.data?.results ? data?.data?.results : [];
  return { regimenReason, isLoading, error };
};
