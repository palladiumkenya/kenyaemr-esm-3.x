import { InlineLoading } from '@carbon/react';
import React, { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useQueueEntries, useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import { Queue } from '../../types';
import { useConfig } from '@openmrs/esm-framework';
import { ExpressWorkflowConfig } from '../../config-schema';

const MCHTriage: React.FC = () => {
  const { t } = useTranslation();
  const { queues, isLoading, error } = useQueues();
  const triageQueues = queues
    .filter(
      (queue) => queue.name.toLowerCase().includes('triage') && queue.location.display.toLowerCase().includes('mch'),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const [currentQueue, setCurrentQueue] = useState<Queue>(triageQueues[0]);
  const { queuStatusConceptUuids } = useConfig<ExpressWorkflowConfig>();
  const queue = useMemo(() => currentQueue ?? triageQueues[0], [currentQueue, triageQueues]);
  const {
    queueEntries: finishedQueueEntries,
    error: finishedError,
    isLoading: finishedIsLoading,
  } = useQueueEntries({
    location: queue?.location?.uuid ? [queue?.location?.uuid] : undefined,
    statuses: [queuStatusConceptUuids.finishedStatus],
  });

  if (isLoading || finishedIsLoading) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  return (
    <QueueTab
      queues={triageQueues}
      navigatePath="mch"
      cards={[
        // { title: t('patientInWaiting', 'Patient in waiting'), value: awaitingCount.toString() },
        { title: t('patientAttended', 'Patient attended'), value: finishedQueueEntries?.length?.toString() },
      ]}
      onTabChanged={setCurrentQueue}
    />
  );
};

export default MCHTriage;
