import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

interface CaseManager {
  uuid: string;
  display: string;
}

interface CaseManagerResponse {
  results: CaseManager[];
}
export const useCaseManagers = () => {
  const customRepresentation = 'custom:(uuid,display)';
  const url = `/ws/rest/v1/provider?v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<{ data: CaseManagerResponse }>(url, openmrsFetch);

  return { data, error };
};
