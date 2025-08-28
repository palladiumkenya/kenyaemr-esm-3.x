import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
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
  const customRepresentation =
    'custom:(uuid,display,queue:(uuid,display,name,location:(uuid,display),service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display)),status,patient:(uuid,display,identifiers:(uuid,identifier,identifierType:(uuid,display)),person:(uuid,display,gender,birthdate)),visit:(uuid,display,startDatetime),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

  // Build query parameters from filters
  const buildQueryParams = (filters?: QueueEntryFilters): string => {
    const params = new URLSearchParams();

    // Always add custom representation
    params.append('v', customRepresentation);

    // Add filter parameters if they exist
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

    // Default to non-ended entries if not specified
    if (!filters || filters.isEnded === undefined || filters.isEnded === null) {
      params.append('isEnded', 'false');
    }

    return params.toString();
  };

  const queryString = buildQueryParams(filters);
  const url = `/ws/rest/v1/queue-entry${queryString ? `?${queryString}` : ''}`;

  const { data, isLoading, error } = useSWR<{ data: { results: Array<QueueEntry> } }>(url, openmrsFetch);

  return {
    queueEntries: data?.data?.results ?? [],
    isLoading,
    error,
  };
};
