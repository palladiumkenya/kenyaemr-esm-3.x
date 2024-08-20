import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PatientIdentifier } from '../types';

const usePatientIdentifiers = (uuid: string) => {
  const customeRepresentation = 'custom:(display,uuid,identifier,identifierType:(uuid,display))';
  const url = `${restBaseUrl}/patient/${uuid}/identifier?v=${customeRepresentation}`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<PatientIdentifier> }>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    identifiers: data?.data?.results ?? [],
    hasType: (typeUuid: string) =>
      (data?.data?.results ?? []).findIndex((id) => id.identifierType.uuid === typeUuid) !== -1,
  };
};

export default usePatientIdentifiers;
