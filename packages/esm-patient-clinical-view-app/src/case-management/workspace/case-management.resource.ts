import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

interface CaseManager {
  uuid: string;
  display: string;
}

interface CaseManagerResponse {
  results: CaseManager[];
}

interface RelationshipType {
  uuid: string;
  displayAIsToB: string;
}

interface RelationshipTypeResponse {
  results: RelationshipType[];
}

export const useCaseManagers = () => {
  const customRepresentation = 'custom:(uuid,display)';
  const url = `/ws/rest/v1/provider?v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<{ data: CaseManagerResponse }>(url, openmrsFetch);

  return { data, error };
};

export const useRelationshipType = () => {
  const customRepresentation = 'custom:(uuid,display)';
  const url = `/ws/rest/v1/relationshiptype?v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<{ data: CaseManagerResponse }>(url, openmrsFetch);

  return { data, error };
};
