import { InlineLoading, IconButton } from '@carbon/react';
import { Renew } from '@carbon/react/icons';
import { ExtensionSlot, HomePictogram, PageHeader, PageHeaderContent, useConfig } from '@openmrs/esm-framework';
import styles from './consultation.scss';
import capitalize from 'lodash-es/capitalize';
import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues, useQueueEntries } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import { useInvestigationStats, useTotalVisits, useQueuePriorityCounts } from './consultation.resource';
import { QueueFilter } from '../../types';
import { ExpressWorkflowConfig } from '../../config-schema';

type ConsultationProps = {
  dashboardTitle: string;
};

const Consultation: React.FC<ConsultationProps> = ({ dashboardTitle }) => {
  const { t } = useTranslation();
  const { queues, isLoading, error } = useQueues();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const consultationQueues = queues.filter(
    (queue) =>
      queue.name.toLowerCase().includes('consultation') &&
      !queue.location.display.toLowerCase().includes('mch') &&
      queue?.queueRooms?.length > 0,
  );

  const usePatientChart = true;

  const { data: totalVisits, isLoading: isLoadingTotalVisits } = useTotalVisits();

  // Use the updated investigation stats hook with single refresh function
  const {
    awaitingCount,
    completedCount,
    totalCount,
    lab,
    radiology,
    procedures,
    isLoading: isLoadingInvestigations,
    refresh: refreshInvestigations,
  } = useInvestigationStats();

  const [filters, setFilters] = useState<Array<QueueFilter>>([]);
  const {
    priorities: { emergencyPriorityConceptUuid, urgentPriorityConceptUuid, notUrgentPriorityConceptUuid },
  } = useConfig<ExpressWorkflowConfig>();

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

  // Single refresh handler for all investigations
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshInvestigations();
    } catch (error) {
      console.error('Error refreshing investigations:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshInvestigations]);

  const cards = useMemo(
    () => [
      {
        title: t('awaitingConsultation', 'Awaiting consultation'),
        value: consultationQueueEntries.length.toString(),
        categories: [
          {
            label: t('emergency', 'Emergency'),
            value: priorityCounts.emergency,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'priority'),
                { key: 'priority', value: emergencyPriorityConceptUuid, label: t('emergency', 'Emergency') },
              ]);
            },
          },
          {
            label: t('urgent', 'Urgent'),
            value: priorityCounts.urgent,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'priority'),
                { key: 'priority', value: urgentPriorityConceptUuid, label: t('urgent', 'Urgent') },
              ]);
            },
          },
          {
            label: t('notUrgent', 'Not Urgent'),
            value: priorityCounts.notUrgent,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'priority'),
                { key: 'priority', value: notUrgentPriorityConceptUuid, label: t('notUrgent', 'Not Urgent') },
              ]);
            },
          },
        ],
      },
      {
        title: t('investigationAwaiting', 'Investigation Awaiting'),
        value: awaitingCount.toString(),
        categories: [
          { label: t('lab', 'Lab'), value: lab.awaiting },
          { label: t('radiology', 'Radiology'), value: radiology.awaiting },
          { label: t('procedures', 'Procedures'), value: procedures.awaiting },
        ],
        refreshButton:
          isRefreshing || isLoadingInvestigations ? (
            <InlineLoading description={t('refreshing', 'Refreshing...')} />
          ) : (
            <IconButton
              label={t('refreshInvestigations', 'Refresh investigations')}
              kind="ghost"
              size="sm"
              onClick={handleRefresh}
              className={styles.refreshButton}>
              <Renew size={16} />
            </IconButton>
          ),
      },
      {
        title: t('investigationCompleted', 'Investigation Completed'),
        value: completedCount.toString(),
        categories: [
          { label: t('lab', 'Lab'), value: lab.completed },
          { label: t('radiology', 'Radiology'), value: radiology.completed },
          { label: t('procedures', 'Procedures'), value: procedures.completed },
        ],
      },
      {
        title: t('totalVisits', 'Total Visits'),
        value: totalVisits?.length?.toString() ?? '0',
      },
    ],
    [
      t,
      consultationQueueEntries.length,
      priorityCounts,
      emergencyPriorityConceptUuid,
      urgentPriorityConceptUuid,
      notUrgentPriorityConceptUuid,
      awaitingCount,
      lab,
      radiology,
      procedures,
      handleRefresh,
      isRefreshing,
      isLoadingInvestigations,
      completedCount,
      totalVisits,
    ],
  );

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
        filters={filters}
        onFiltersChanged={setFilters}
      />
    </div>
  );
};

export default Consultation;
