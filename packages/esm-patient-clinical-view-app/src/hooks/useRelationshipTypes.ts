import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { RelationShipType } from '../types';

const useRelationshipTypes = () => {
  const customeRepresentation = 'custom:(uuid,displayAIsToB,displayBIsToA)';
  const url = `/ws/rest/v1/relationshiptype?v=${customeRepresentation}`;

  const { data, error, isLoading } = useSWR<{ data: { results: RelationShipType[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    relationshipTypes: data?.data?.results ?? [],
  };
};

export default useRelationshipTypes;
