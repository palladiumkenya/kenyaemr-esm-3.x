import React, { useMemo, useState } from 'react';
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
import QueueSummaryCards, { QueueSummaryCard } from '../../shared/queue/queue-summary-cards.component';
import styles from './triage.scss';
import { Queue, QueueFilter } from '../../types';
import { useTriageQueuesMetrics } from './triage.resource';
import { ExpressWorkflowConfig } from '../../config-schema';

type TriageProps = {
  dashboardTitle: string;
};

const Triage: React.FC<TriageProps> = ({ dashboardTitle }) => {
  return (
    <div>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />
        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>
      <TriageQueueTab />
    </div>
  );
};

export default Triage;

const TriageQueueTab: React.FC = () => {
  const { t } = useTranslation();
  const {
    queueStatusConceptUuids: { finishedStatus, waitingStatus, inServiceStatus },
    queueServiceConceptUuids,
  } = useConfig<ExpressWorkflowConfig>();
  const [currQueue, setCurrQueue] = useState<Queue>();
  const [filters, setFilters] = useState<Array<QueueFilter>>([]);

  const {
    queues,
    isLoading: isLoadingQueues,
    error: errorLoadingQueues,
    isValidating: isValidatingQueues,
  } = useQueues();

  const triageQueues = queues
    .filter(
      (queue) =>
        queue.service.uuid === queueServiceConceptUuids.triageService &&
        !queue.location.display.toLowerCase().includes('mch') &&
        queue?.queueRooms?.length > 0,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const activeQueue = useMemo(() => currQueue ?? triageQueues[0], [currQueue, triageQueues]);

  const {
    error: metricsError,
    isLoading: isLoadingMetrics,
    waitingEntries,
    attendedToEntries,
    isValidating: isValidatingMetrics,
  } = useTriageQueuesMetrics(activeQueue);

  const isLoading = (isLoadingQueues || isLoadingMetrics) && !isValidatingQueues && !isValidatingMetrics;

  if (isLoading) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  if (metricsError || errorLoadingQueues) {
    return (
      <ErrorState
        error={metricsError ?? errorLoadingQueues}
        headerTitle={t('errorLoadingQueues', 'Error loading queues')}
      />
    );
  }
  const cards: Array<QueueSummaryCard> = [
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
          { key: 'status', value: `${finishedStatus},${inServiceStatus}`, label: t('attendedTo', 'Attended to') },
        ]);
      },
    },
  ];

  return (
    <>
      <QueueSummaryCards cards={cards} />
      <QueueTab
        queues={triageQueues}
        navigatePath="triage"
        usePatientChart
        onTabChanged={setCurrQueue}
        filters={filters}
        onFiltersChanged={setFilters}
      />
    </>
  );
};
