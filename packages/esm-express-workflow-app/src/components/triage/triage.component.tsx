import React, { useState } from 'react';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  HomePictogram,
  ErrorState,
  PageHeaderContent,
  ExtensionSlot,
  useConfig,
} from '@openmrs/esm-framework';
import { InlineLoading } from '@carbon/react';

import { useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import styles from './triage.scss';
import { Queue, QueueFilter } from '../../types';
import { useTriageQueuesMetrics } from './triage.resource';
import { ExpressWorkflowConfig } from '../../config-schema';

type TriageProps = {
  dashboardTitle: string;
};

const Triage: React.FC<TriageProps> = ({ dashboardTitle }) => {
  const { t } = useTranslation();
  const [currQueue, setCurrQueue] = useState<Queue>();
  const { queues, isLoading, error } = useQueues();
  const [filters, setFilters] = useState<Array<QueueFilter>>([]);

  const triageQueues = queues
    .filter(
      (queue) =>
        queue.name.toLowerCase().includes('triage') &&
        !queue.location.display.toLowerCase().includes('mch') &&
        queue?.queueRooms?.length > 0,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const {
    error: metricsError,
    isLoading: isLoadingMetrics,
    waitingEntries,
    inServiceEntries,
    finishedEntries,
  } = useTriageQueuesMetrics(currQueue ?? triageQueues[0]);
  const {
    queuStatusConceptUuids: { finishedStatus, waitingStatus },
  } = useConfig<ExpressWorkflowConfig>();
  if (isLoading || isLoadingMetrics) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  if (error || metricsError) {
    return <ErrorState error={error ?? metricsError} headerTitle={t('errorLoadingQueues', 'Error loading queues')} />;
  }

  const attendedToEntries = [...inServiceEntries, ...finishedEntries];

  const cards = [
    {
      title: t('clientsPatientsWaiting', 'Clients/Patients waiting'),
      value: waitingEntries.length.toString(),
      onClick: () => {
        setFilters((prevFilters) => [
          ...prevFilters.filter((f) => f.key !== 'status'),
          { key: 'status', value: waitingStatus, label: t('waiting', 'Waiting') },
        ]);
      },
    },
    {
      title: t('clientsPatientsAttendedTo', 'Clients/Patients attended to'),
      value: attendedToEntries.length.toString(),
      onClick: () => {
        setFilters((prevFilters) => [
          ...prevFilters.filter((f) => f.key !== 'status'),
          { key: 'status', value: finishedStatus, label: t('finished', 'Finished') },
        ]);
      },
    },
  ];

  return (
    <div>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />
        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>
      <QueueTab
        queues={triageQueues}
        navigatePath="triage"
        usePatientChart
        cards={cards}
        onTabChanged={setCurrQueue}
        filters={filters}
        onFiltersChanged={setFilters}
      />
    </div>
  );
};

export default Triage;
