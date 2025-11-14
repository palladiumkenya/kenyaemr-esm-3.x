import { InlineLoading } from '@carbon/react';
import React, { useState } from 'react';

import { ErrorState, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import { Queue, QueueFilter } from '../../types';
import { useTriageQueuesMetrics } from '../triage/triage.resource';
import { ExpressWorkflowConfig } from '../../config-schema';

const MCHTriage: React.FC = () => {
  const { t } = useTranslation();
  const { queues, isLoading, error } = useQueues();
  const [currQueue, setCurrQueue] = useState<Queue>();
  const [filters, setFilters] = useState<Array<QueueFilter>>([]);
  const {
    queuStatusConceptUuids: { finishedStatus, waitingStatus },
  } = useConfig<ExpressWorkflowConfig>();
  const triageQueues = queues
    .filter(
      (queue) =>
        queue.name.toLowerCase().includes('triage') &&
        queue.location.display.toLowerCase().includes('mch') &&
        queue?.queueRooms?.length > 0,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const {
    error: metricsError,
    isLoading: isLoadingMetrics,
    finishedEntries,
    waitingEntries,
  } = useTriageQueuesMetrics(currQueue ?? triageQueues[0]);

  if (isLoading || isLoadingMetrics) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  if (error || metricsError) {
    return <ErrorState error={error ?? metricsError} headerTitle={t('errorLoadingQueues', 'Error loading queues')} />;
  }

  return (
    <QueueTab
      queues={triageQueues}
      navigatePath="mch"
      cards={[
        {
          title: t('patientsAwaiting', 'Patient awaiting'),
          value: waitingEntries?.length?.toString(),
          onClick: () => {
            setFilters((prevFilters) => [
              ...prevFilters.filter((f) => f.key !== 'status'),
              { key: 'status', value: waitingStatus, label: t('waiting', 'Waiting') },
            ]);
          },
        },
        {
          title: t('patientAttended', 'Patient attended to'),
          value: finishedEntries?.length?.toString(),
          onClick: () => {
            setFilters((prevFilters) => [
              ...prevFilters.filter((f) => f.key !== 'status'),
              { key: 'status', value: finishedStatus, label: t('finished', 'Finished') },
            ]);
          },
        },
      ]}
      onTabChanged={setCurrQueue}
      usePatientChart
      filters={filters}
      onFiltersChanged={setFilters}
    />
  );
};

export default MCHTriage;
