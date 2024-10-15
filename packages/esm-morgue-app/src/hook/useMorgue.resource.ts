import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useConfig, useOpenmrsPagination } from '@openmrs/esm-framework';
import { DeceasedPatientResponse, ChartConfig } from '../types';
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

export function useInfiniteVisits(patientUuid: string) {
  const config = useConfig<ChartConfig>();
  const customRepresentation =
    'custom:(visitType:(uuid,name,display),uuid,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis),form:(uuid,display),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

  const getKey = (pageIndex, previousPageData) => {
    const pageSize = config.numberOfVisitsToLoad;

    if (previousPageData && !previousPageData?.data?.links.some((link) => link.rel === 'next')) {
      return null;
    }

    let url = `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}&limit=${pageSize}`;

    if (pageIndex) {
      url += `&startIndex=${pageIndex * pageSize}`;
    }

    return url;
  };

  const { data, error, isLoading, isValidating, mutate, size, setSize } = useSWRInfinite(
    patientUuid ? getKey : null,
    openmrsFetch,
    { parallel: true },
  );

  return {
    visits: data ? [].concat(data?.flatMap((page) => page.data.results)) : null,
    error,
    hasMore: data?.length ? !!data[data.length - 1].data?.links?.some((link) => link.rel === 'next') : false,
    isLoading,
    isValidating,
    mutateVisits: mutate,
    setSize,
    size,
  };
}

export const usePatientPaginatedVisits = (patientUuid: string) => {
  const customRepresentation =
    'custom:(visitType:(uuid,name,display),uuid,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis),form:(uuid,display),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';
  const url = makeUrlUrl(`${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`);

  const paginatedVisit = useOpenmrsPagination(url, 10);
  return paginatedVisit;
};
