import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Relationship } from '../types';

const useRelationship = (relationshipUuid: string) => {
  const customRepresentation = `custom:(display,uuid,startDate,endDate,relationshipType:(uuid,display,aIsToB,bIsToA),personA,personB)`;
  const url = `${restBaseUrl}/relationship/${relationshipUuid}?v=${customRepresentation}`;
  const { isLoading, data, error } = useSWR<FetchResponse<Relationship>>(url, openmrsFetch);
  return {
    isLoading,
    error,
    relationship: data?.data,
  };
};

export default useRelationship;
