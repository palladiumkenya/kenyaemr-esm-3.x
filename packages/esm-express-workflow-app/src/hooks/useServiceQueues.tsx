import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Queue, QueueEntry } from '../types/index';

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

export const useQueueEntries = () => {
  const customRepresentation =
    'custom:(uuid,display,queue:(uuid,display,name,location:(uuid,display),service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display)),status,patient:(uuid,display,identifiers:(uuid,identifier,identifierType:(uuid,display)),person:(uuid,display,gender,birthdate)),visit:(uuid,display,startDatetime),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

  const { data, isLoading, error } = useSWR<{ data: { results: Array<QueueEntry> } }>(
    `/ws/rest/v1/queue-entry?v=${customRepresentation}&isEnded=false`,
    openmrsFetch,
  );

  return {
    queueEntries: data?.data?.results || [],
    isLoading,
    error,
  };
};
