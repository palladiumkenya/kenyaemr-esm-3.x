import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { RelationShipType } from '../types';
import { ConfigObject } from '../config-schema';

const useRelationshipTypes = () => {
  const customeRepresentation = 'custom:(uuid,displayAIsToB,displayBIsToA)';
  const url = `/ws/rest/v1/relationshiptype?v=${customeRepresentation}`;
  const { relationshipTypesList } = useConfig<ConfigObject>();
  const { data, error, isLoading } = useSWR<{ data: { results: RelationShipType[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    relationshipTypes: (data?.data?.results ?? []).filter(
      (r) => relationshipTypesList.findIndex((rl) => rl.uuid === r.uuid) !== -1,
    ),
  };
};

export default useRelationshipTypes;
