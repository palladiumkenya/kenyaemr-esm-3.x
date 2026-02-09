import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useConfig } from '@openmrs/esm-framework';

import { type ExpressWorkflowConfig } from '../../config-schema';
import { useQueueEntries } from '../../hooks/useServiceQueues';
import { type Queue } from '../../types';

export const useTriageQueuesMetrics = (queue?: Queue) => {
  const { queueStatusConceptUuids } = useConfig<ExpressWorkflowConfig>();

  const {
    queueEntries: allTriageEntries,
    isLoading,
    error,
    isValidating: isValidatingQueueEntries,
  } = useQueueEntries({
    location: queue?.location?.uuid ? [queue.location.uuid] : undefined,
    startedOnOrAfter: dayjs().subtract(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
  });

  const queueUuid = queue?.uuid;

  const waitingEntries = useMemo(
    () =>
      allTriageEntries.filter(
        (entry) => entry?.queue?.uuid === queueUuid && entry?.status?.uuid === queueStatusConceptUuids.waitingStatus,
      ),
    [allTriageEntries, queueUuid, queueStatusConceptUuids.waitingStatus],
  );

  const inServiceEntries = useMemo(
    () =>
      allTriageEntries.filter(
        (entry) => entry?.queue?.uuid === queueUuid && entry?.status?.uuid === queueStatusConceptUuids.inServiceStatus,
      ),
    [allTriageEntries, queueUuid, queueStatusConceptUuids.inServiceStatus],
  );

  const finishedEntries = useMemo(
    () =>
      allTriageEntries.filter(
        (entry) => entry?.queue?.uuid === queueUuid && entry?.status?.uuid === queueStatusConceptUuids.finishedStatus,
      ),
    [allTriageEntries, queueUuid, queueStatusConceptUuids.finishedStatus],
  );

  const attendedToEntries = useMemo(
    () =>
      allTriageEntries.filter(
        (entry) =>
          entry?.queue?.uuid === queueUuid &&
          (entry?.status?.uuid === queueStatusConceptUuids.inServiceStatus ||
            entry?.status?.uuid === queueStatusConceptUuids.finishedStatus),
      ),
    [allTriageEntries, queueUuid, queueStatusConceptUuids.inServiceStatus, queueStatusConceptUuids.finishedStatus],
  );

  return {
    isLoading,
    waitingEntries,
    inServiceEntries,
    finishedEntries,
    attendedToEntries,
    error,
    isValidating: isValidatingQueueEntries,
  };
};
