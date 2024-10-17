import { openmrsFetch, restBaseUrl, useOpenmrsPagination } from '@openmrs/esm-framework';
import { DeceasedPatientResponse } from '../types';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite from 'swr/infinite';

export const useDeceasedPatient = () => {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true`;

  const { data, error, isLoading, mutate } = useSWRImmutable<{ data: DeceasedPatientResponse }>(url, openmrsFetch);

  const deceasedPatient = data?.data?.results || null;

  return { data: deceasedPatient, error, isLoading, mutate };
};
