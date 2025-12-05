import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import useSWR from 'swr';
import { ExpressWorkflowConfig } from '../config-schema';
import { Queue, QueueEntry, QueueEntryFilters } from '../types/index';

export const useQueues = () => {
  const { data, isLoading, error } = useSWR<{ data: { results: Array<Queue> } }>(
    '/ws/rest/v1/queue?v=full',
    openmrsFetch,
  );

  return {
    queues: data?.data?.results || [],
    isLoading,
    error,
  };
};

export const useQueueEntries = (filters?: QueueEntryFilters) => {
  const { outpatientVisitTypeUuid } = useConfig<ExpressWorkflowConfig>();
  const repString =
    'custom:(uuid,display,queue,status,patient:(uuid,display,person,identifiers:(uuid,display,identifier,identifierType)),visit:(uuid,display,startDatetime,visitType:(uuid,display),encounters:(uuid,display,diagnoses,encounterDatetime,encounterType,obs,encounterProviders,voided),attributes:(uuid,display,value,attributeType)),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

  const buildQueryParams = (filters?: QueueEntryFilters & { status: string[] }): string => {
    const params = new URLSearchParams();
    params.append('v', repString);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    if (!filters || filters.isEnded === undefined || filters.isEnded === null) {
      params.append('isEnded', 'false');
    }

    return params.toString();
  };

  const queryString = buildQueryParams({ ...filters, status: filters?.statuses ?? [], statuses: [] });
  const url = `/ws/rest/v1/queue-entry${queryString ? `?${queryString}` : ''}`;

  const { data, isLoading, error } = useSWR<{ data: { results: Array<QueueEntry> } }>(url, openmrsFetch);
  const queueEntries = useMemo(() => {
    return (data?.data?.results ?? [])?.filter((entry) => {
      return (
        dayjs(entry.startedAt).isAfter(dayjs().subtract(24, 'hour')) &&
        entry?.visit?.visitType?.uuid === outpatientVisitTypeUuid
      );
    });
  }, [data?.data?.results, outpatientVisitTypeUuid]);

  return {
    queueEntries,
    isLoading,
    error,
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
