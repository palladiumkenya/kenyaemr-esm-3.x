import React, { useState } from 'react';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { PageHeader, HomePictogram, ErrorState, PageHeaderContent, ExtensionSlot } from '@openmrs/esm-framework';
import { InlineLoading } from '@carbon/react';

import { useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import styles from './triage.scss';
import { Queue } from '../../types';
import { useTriageQueuesMetrics } from './triage.resource';

type TriageProps = {
  dashboardTitle: string;
};

const Triage: React.FC<TriageProps> = ({ dashboardTitle }) => {
  const { t } = useTranslation();
  const [currQueue, setCurrQueue] = useState<Queue>();
  const { queues, isLoading, error } = useQueues();
  const triageQueues = queues
    .filter(
      (queue) => queue.name.toLowerCase().includes('triage') && !queue.location.display.toLowerCase().includes('mch'),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const {
    error: metricsError,
    isLoading: isLoadingMetrics,
    waitingEntries,
    inServiceEntries,
    finishedEntries,
  } = useTriageQueuesMetrics(currQueue ?? triageQueues[0]);

  if (isLoading || isLoadingMetrics) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  if (error || metricsError) {
    return <ErrorState error={error ?? metricsError} headerTitle={t('errorLoadingQueues', 'Error loading queues')} />;
  }

  const attendedToEntries = [...inServiceEntries, ...finishedEntries];

  const cards = [
    {
      title: t('CilentsPatientsWaiting', 'Clients/Patients waiting'),
      value: waitingEntries.length.toString(),
    },
    {
      title: t('CilentsPatientsAttendedTo', 'Clients/Patients attended to'),
      value: attendedToEntries.length.toString(),
    },
  ];

  return (
    <div>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />
        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>
      <QueueTab queues={triageQueues} navigatePath="triage" usePatientChart cards={cards} onTabChanged={setCurrQueue} />
    </div>
  );
};

export default Triage;
