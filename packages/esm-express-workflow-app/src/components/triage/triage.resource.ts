import { useConfig } from '@openmrs/esm-framework';
import { ExpressWorkflowConfig } from '../../config-schema';
import { useQueueEntries } from '../../hooks/useServiceQueues';
import { Queue } from '../../types';

export const useTriageQueuesMetrics = (queue?: Queue) => {
  const { queueServiceConceptUuids, queuStatusConceptUuids } = useConfig<ExpressWorkflowConfig>();
  const {
    queueEntries: waitingEntries,
    isLoading: isLoadingWaiting,
    error: waitingError,
  } = useQueueEntries({
    service: [queueServiceConceptUuids.triageService],
    statuses: [queuStatusConceptUuids.waitingStatus],
    location: queue?.location?.uuid ? [queue.location.uuid] : undefined,
  });
  const {
    queueEntries: inServiceEntries,
    isLoading: isLoadingInService,
    error: inServiceError,
  } = useQueueEntries({
    service: [queueServiceConceptUuids.triageService],
    statuses: [queuStatusConceptUuids.inServiceStatus],
    location: queue?.location?.uuid ? [queue.location.uuid] : undefined,
  });
  const {
    queueEntries: finishedEntries,
    isLoading: isLoadingFinished,
    error: finishedError,
  } = useQueueEntries({
    service: [queueServiceConceptUuids.triageService],
    statuses: [queuStatusConceptUuids.finishedStatus],
    location: queue?.location?.uuid ? [queue.location.uuid] : undefined,
  });

  return {
    isLoading: isLoadingFinished || isLoadingInService || isLoadingWaiting,
    waitingEntries,
    inServiceEntries,
    finishedEntries,
    error: finishedError ?? inServiceError ?? waitingError,
  };
};
