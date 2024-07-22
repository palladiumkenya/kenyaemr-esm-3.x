import { openmrsFetch, OpenmrsResource, restBaseUrl, useConfig, Visit } from '@openmrs/esm-framework';
import useSWRInfinite from 'swr/infinite';
import { ChartConfig } from '../../config-schema';

export interface MappedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  editPrivilege: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
  visitUuid: string;
  visitType: string;
  visitTypeUuid?: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
    display: string;
  }>;
  value: any;
  obsDatetime?: string;
}
export function mapEncounters(visit: Visit): MappedEncounter[] {
  return visit?.encounters?.map((encounter) => ({
    id: encounter?.uuid,
    datetime: encounter?.encounterDatetime,
    encounterType: encounter?.encounterType?.display,
    editPrivilege: encounter?.encounterType?.editPrivilege?.display,
    form: encounter?.form,
    obs: encounter?.obs,
    visitUuid: visit?.uuid,
    visitType: visit?.visitType?.display,
    visitTypeUuid: visit?.visitType?.uuid,
    visitStartDatetime: visit?.startDatetime,
    visitStopDatetime: visit?.stopDatetime,
    provider:
      encounter?.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
  }));
}

export function useInfiniteVisits(patientUuid: string) {
  const config = useConfig<ChartConfig>();
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis),form:(uuid,display),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

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
