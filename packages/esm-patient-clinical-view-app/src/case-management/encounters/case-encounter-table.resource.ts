import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWRInfinite from 'swr/infinite';

export interface ChartConfig {
  freeTextFieldConceptUuid: string;
  offlineVisitTypeUuid: string;
  visitTypeResourceUrl: string;
  showRecommendedVisitTypeTab: boolean;
  visitAttributeTypes: Array<{
    uuid: string;
    required: boolean;
    displayInThePatientBanner: boolean;
    showWhenExpression?: string;
  }>;
  showServiceQueueFields: boolean;
  visitQueueNumberAttributeUuid: string;
  showAllEncountersTab: boolean;
  defaultFacilityUrl: string;
  showUpcomingAppointments: boolean;
  logo: {
    src: string;
    alt: string;
    name: string;
  };
  disableChangingVisitLocation: boolean;
  numberOfVisitsToLoad: number;
  showExtraVisitAttributesSlot: boolean;
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
export function deleteEncounter(encounterUuid: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}
