import { InlineLoading } from '@carbon/react';
import { ExtensionSlot, HomePictogram, PageHeader, PageHeaderContent } from '@openmrs/esm-framework';
import styles from './consultation.scss';
import capitalize from 'lodash-es/capitalize';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues, useQueueEntries } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import { useInvestigationStats, useTotalVisits, useQueuePriorityCounts } from './consultation.resource';

type ConsultationProps = {
  dashboardTitle: string;
};

const Consultation: React.FC<ConsultationProps> = ({ dashboardTitle }) => {
  const { t } = useTranslation();
  const { queues, isLoading, error } = useQueues();
  const consultationQueues = queues.filter(
    (queue) =>
      queue.name.toLowerCase().includes('consultation') &&
      !queue.location.display.toLowerCase().includes('mch') &&
      queue?.queueRooms?.length > 0,
  );

  const usePatientChart = true;

  const { data: totalVisits, isLoading: isLoadingTotalVisits } = useTotalVisits();
  const { awaitingCount, completedCount, totalCount, isLoading: isLoadingInvestigations } = useInvestigationStats();

  const consultationLocations = useMemo(
    () => consultationQueues.map((queue) => queue.location.uuid),
    [consultationQueues],
  );

  const { queueEntries, isLoading: isLoadingQueueEntries } = useQueueEntries({
    location: consultationLocations,
  });

  const consultationQueueEntries = useMemo(() => {
    if (!queueEntries?.length || !consultationQueues.length) {
      return [];
    }

    const serviceUuids = consultationQueues.map((q) => q.service?.uuid).filter(Boolean);
    return queueEntries.filter((entry) => serviceUuids.includes(entry?.queue?.service?.uuid));
  }, [queueEntries, consultationQueues]);

  const priorityCounts = useQueuePriorityCounts(consultationQueueEntries);

  const cards = [
    {
      title: t('awaitingConsultation', 'Awaiting consultation'),
      value: consultationQueueEntries.length.toString(),
      categories: [
        { label: t('emergency', 'Emergency'), value: priorityCounts.emergency },
        { label: t('urgent', 'Urgent'), value: priorityCounts.urgent },
        { label: t('notUrgent', 'Not Urgent'), value: priorityCounts.notUrgent },
      ],
    },
    {
      title: t('investigationStatus', 'Investigation Status'),
      value: totalCount.toString(),
      categories: [
        { label: t('awaiting', 'Awaiting'), value: awaitingCount },
        { label: t('completed', 'Completed'), value: completedCount },
      ],
    },
    {
      title: t('totalVisits', 'Total Visits'),
      value: totalVisits?.length?.toString() ?? '0',
    },
  ];

  if (isLoading || isLoadingTotalVisits || isLoadingInvestigations || isLoadingQueueEntries) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  return (
    <div className={`omrs-main-content`}>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />
        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>
      <QueueTab
        queues={consultationQueues}
        cards={cards}
        navigatePath="consultation"
        usePatientChart={usePatientChart}
      />
    </div>
  );
};

export default Consultation;
