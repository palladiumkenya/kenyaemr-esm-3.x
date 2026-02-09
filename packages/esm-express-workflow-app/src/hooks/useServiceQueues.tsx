import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import dayjs from 'dayjs';
import { openmrsFetch, restBaseUrl, useConfig, useOpenmrsPagination } from '@openmrs/esm-framework';

import { type ExpressWorkflowConfig } from '../config-schema';
import { QueueEntriesPagination, type Queue, type QueueEntry, type QueueEntryFilters } from '../types/index';

const QUEUE_LIST_REP =
  'custom:(uuid,display,name,location:(uuid,display),service:(uuid,display),queueRooms:(uuid,display))';

const SWR_QUEUE_OPTIONS = {
  dedupingInterval: 5000,
  revalidateOnFocus: false,
} as const;

export const useQueues = () => {
  const queueListKey = `/ws/rest/v1/queue?v=${encodeURIComponent(QUEUE_LIST_REP)}`;
  const { data, isLoading, error, isValidating } = useSWRImmutable<{ data: { results: Array<Queue> } }>(
    queueListKey,
    openmrsFetch,
    SWR_QUEUE_OPTIONS,
  );

  return {
    queues: data?.data?.results || [],
    isLoading,
    error,
    isValidating,
  };
};

export const useQueueEntries = (filters?: QueueEntryFilters, defaultPageSize: number = 100) => {
  const { outpatientVisitTypeUuid } = useConfig<ExpressWorkflowConfig>();
  const repString =
    'custom:(uuid,queue:(uuid,display,name,location:(uuid,display)),status:(uuid,display),patient:(uuid,person:(uuid,display),identifiers),visit:(uuid,visitType:(uuid),attributes:(uuid,value,attributeType:(uuid))),priority:(uuid,display),priorityComment,startedAt,previousQueueEntry:(uuid,queue:(uuid,display)))';

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.append('v', repString);

    const merged = {
      ...filters,
      status: filters?.statuses ?? [],
      statuses: undefined,
      startedOnOrAfter: filters?.startedOnOrAfter ?? undefined,
      startedOnOrBefore: filters?.startedOnOrBefore ?? undefined,
    };
    if (merged) {
      Object.entries(merged).forEach(([key, value]) => {
        if (key === 'statuses' || value === undefined || value === null) {
          return;
        }
        if (Array.isArray(value)) {
          [...value].sort((a, b) => String(a).localeCompare(String(b))).forEach((v) => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      });
    }

    if (filters?.isEnded == null) {
      params.append('isEnded', 'false');
    }

    return params.toString();
  }, [
    filters?.location?.join(','),
    filters?.service?.join(','),
    [...(filters?.statuses ?? [])].sort((a, b) => String(a).localeCompare(String(b))).join(','),
    filters?.priorities?.join(','),
    filters?.patient,
    filters?.visit,
    filters?.hasVisit,
    filters?.isEnded,
    filters?.locationsWaitingFor?.join(','),
    filters?.providersWaitingFor?.join(','),
    filters?.queuesComingFrom?.join(','),
  ]);

  const url = queryString ? `/ws/rest/v1/queue-entry?${queryString}` : '/ws/rest/v1/queue-entry';

  const {
    data,
    isLoading,
    isValidating,
    error,
    totalPages,
    totalCount,
    currentPage,
    currentPageSize,
    paginated,
    showNextButton,
    showPreviousButton,
    goTo,
    goToNext,
    goToPrevious,
  } = useOpenmrsPagination<QueueEntry>(url, defaultPageSize, {
    swrConfig: {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  });

  const queueEntries = useMemo(() => {
    return (data ?? [])?.filter((entry) => {
      return (
        dayjs(entry.startedAt).isAfter(dayjs().subtract(24, 'hour')) &&
        entry?.visit?.visitType?.uuid === outpatientVisitTypeUuid
      );
    });
  }, [data, outpatientVisitTypeUuid]);

  const pagination: QueueEntriesPagination = {
    totalPages,
    totalCount,
    currentPage,
    currentPageSize,
    paginated,
    showNextButton,
    showPreviousButton,
    goTo,
    goToNext,
    goToPrevious,
  };

  return {
    queueEntries,
    isLoading,
    isValidating,
    error,
    pagination,
  };
};
export function serveQueueEntry(servicePointName: string, ticketNumber: string, status: string, locationUuid?: string) {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/queueutil/assignticket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      servicePointName,
      ticketNumber,
      status,
      locationUuid: locationUuid,
    },
  });
}
