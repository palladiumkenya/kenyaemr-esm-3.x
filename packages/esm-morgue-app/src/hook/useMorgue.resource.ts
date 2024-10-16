import { openmrsFetch, restBaseUrl, useOpenmrsPagination } from '@openmrs/esm-framework';
import { DeceasedPatientResponse } from '../types';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite from 'swr/infinite';
import { makeUrlUrl } from '../utils/utils';

export const useDeceasedPatient = () => {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true`;

  const { data, error, isLoading, mutate } = useSWRImmutable<{ data: DeceasedPatientResponse }>(url, openmrsFetch);

  const deceasedPatient = data?.data?.results || null;

  return { data: deceasedPatient, error, isLoading, mutate };
};

export const usePatientPaginatedEncounters = (patientUuid: string) => {
  const customRepresentation =
    'custom:(visitType:(uuid,name,display),uuid,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis),form:(uuid,display),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';
  const url = makeUrlUrl(`${restBaseUrl}/encounter?patient=${patientUuid}&v=full`);

  const paginatedEncounter = useOpenmrsPagination(url, 10);
  return paginatedEncounter;
};
