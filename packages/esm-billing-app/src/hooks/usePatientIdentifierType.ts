import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../config-schema';
import { type PatientIdentifierResponse } from '../types';
import useSWR from 'swr';

export const usePatientIdentifier = (patientUuid: string) => {
  const url = `${restBaseUrl}/patient/${patientUuid}/identifier?v=custom:(uuid,identifier,identifierType:(uuid,required,name),preferred)`;
  const { nationalIdIdentifierTypeUUID } = useConfig<BillingConfig>();

  const { data, isLoading, error } = useSWR<{ data: PatientIdentifierResponse }>(
    patientUuid ? url : null,
    openmrsFetch,
  );

  const nationalIdIdentifier = data?.data?.results?.find(
    (identifier) => identifier.identifierType?.uuid === nationalIdIdentifierTypeUUID,
  );

  return {
    identifier: nationalIdIdentifier,
    nationalId: nationalIdIdentifier?.identifier || null,
    isLoading,
    error,
    allIdentifiers: data?.data?.results,
  };
};
