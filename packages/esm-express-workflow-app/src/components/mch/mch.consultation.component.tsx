import React, { useCallback, useMemo, useState } from 'react';
import { IconButton, InlineLoading } from '@carbon/react';
import { Renew } from '@carbon/react/icons';
import { useConfig } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

import { ExpressWorkflowConfig } from '../../config-schema';
import { useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import QueueSummaryCards, { QueueSummaryCard } from '../../shared/queue/queue-summary-cards.component';
import { Queue, QueueFilter } from '../../types';
import {
  useConsultationQueueMetrics,
  useInvestigationStats,
  useTotalVisits,
} from '../consultation/consultation.resource';
import styles from '../consultation/consultation.scss';

const MCHConsultation: React.FC = () => {
  const { t } = useTranslation();
  const { queues, isLoading: isLoadingQueues } = useQueues();
  const [currQueue, setCurrQueue] = useState<Queue>();
  const [filters, setFilters] = useState<Array<QueueFilter>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    priorities: { emergencyPriorityConceptUuid, urgentPriorityConceptUuid, notUrgentPriorityConceptUuid },
    queueServiceConceptUuids,
  } = useConfig<ExpressWorkflowConfig>();
  const {
    data: totalVisits,
    isLoading: isLoadingTotalVisits,
    isValidating: isValidatingTotalVisits,
  } = useTotalVisits();

  const consultationQueues = queues.filter(
    (queue) =>
      queue.service.uuid === queueServiceConceptUuids.consultationService &&
      queue.location.display.toLowerCase().includes('mch') &&
      queue?.queueRooms?.length > 0,
  );
  const activeQueue = useMemo(() => currQueue ?? consultationQueues[0], [currQueue, consultationQueues]);

  const {
    waitingEntries,
    isLoading: isLoadingQueueMetrics,
    emergencyEntries,
    urgentEntries,
    notUrgentEntries,
    isValidating: isValidatingQueueMetrics,
  } = useConsultationQueueMetrics(activeQueue);
  const {
    awaitingCount,
    completedCount,
    lab,
    radiology,
    procedures,
    isLoading: isLoadingInvestigations,
    refresh: refreshInvestigations,
    investigationCategorizedEntries,
    isValidating: isValidatingInvestigations,
  } = useInvestigationStats(activeQueue);
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

  const cards: Array<QueueSummaryCard> = useMemo(
    () => [
      {
        title: t('awaitingConsultation', 'Awaiting consultation'),
        value: waitingEntries.length.toString(),
        categories: [
          {
            label: t('emergency', 'Emergency'),
            value: emergencyEntries.length,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'priority'),
                { key: 'priority', value: emergencyPriorityConceptUuid, label: t('emergency', 'Emergency') },
              ]);
            },
          },
          {
            label: t('urgent', 'Urgent'),
            value: urgentEntries.length,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'priority'),
                { key: 'priority', value: urgentPriorityConceptUuid, label: t('urgent', 'Urgent') },
              ]);
            },
          },
          {
            label: t('notUrgent', 'Not Urgent'),
            value: notUrgentEntries.length,
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
          {
            label: t('lab', 'Lab'),
            value: lab.awaiting,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'service_awaiting'),
                {
                  key: 'service_awaiting',
                  value: investigationCategorizedEntries.newLabOrders.map((entry) => entry.patient.uuid).join(','),
                  label: t('labAwaiting', 'Lab Awaiting'),
                },
              ]);
            },
          },
          {
            label: t('radiology', 'Radiology'),
            value: radiology.awaiting,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'service_awaiting'),
                {
                  key: 'service_awaiting',
                  value: investigationCategorizedEntries.newRadiologyOrders
                    .map((entry) => entry.patient.uuid)
                    .join(','),
                  label: t('radiologyAwaiting', 'Radiology Awaiting'),
                },
              ]);
            },
          },
          {
            label: t('procedures', 'Procedures'),
            value: procedures.awaiting,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'service_awaiting'),
                {
                  key: 'service_awaiting',
                  value: investigationCategorizedEntries.newProcedureOrders
                    .map((entry) => entry.patient.uuid)
                    .join(','),
                  label: t('proceduresAwaiting', 'Procedures Awaiting'),
                },
              ]);
            },
          },
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
          {
            label: t('lab', 'Lab'),
            value: lab.completed,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'service_completed'),
                {
                  key: 'service_completed',
                  value: investigationCategorizedEntries.completedLabOrders
                    .map((entry) => entry.patient.uuid)
                    .join(','),
                  label: t('labCompleted', 'Lab Completed'),
                },
              ]);
            },
          },
          {
            label: t('radiology', 'Radiology'),
            value: radiology.completed,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'service_completed'),
                {
                  key: 'service_completed',
                  value: investigationCategorizedEntries.completedRadiologyOrders
                    .map((entry) => entry.patient.uuid)
                    .join(','),
                  label: t('radiologyCompleted', 'Radiology Completed'),
                },
              ]);
            },
          },
          {
            label: t('procedures', 'Procedures'),
            value: procedures.completed,
            onClick: () => {
              setFilters((prevFilters) => [
                ...prevFilters.filter((f) => f.key !== 'service_completed'),
                {
                  key: 'service_completed',
                  value: investigationCategorizedEntries.completedProcedureOrders
                    .map((entry) => entry.patient.uuid)
                    .join(','),
                  label: t('proceduresCompleted', 'Procedures Completed'),
                },
              ]);
            },
          },
        ],
      },
      {
        title: t('totalVisits', 'Total Visits'),
        value: totalVisits?.length?.toString() ?? '0',
      },
    ],
    [
      t,
      waitingEntries.length,
      emergencyEntries.length,
      urgentEntries.length,
      notUrgentEntries.length,
      awaitingCount,
      lab.awaiting,
      lab.completed,
      radiology.awaiting,
      radiology.completed,
      procedures.awaiting,
      procedures.completed,
      isRefreshing,
      isLoadingInvestigations,
      handleRefresh,
      completedCount,
      totalVisits?.length,
      emergencyPriorityConceptUuid,
      urgentPriorityConceptUuid,
      notUrgentPriorityConceptUuid,
      investigationCategorizedEntries.newLabOrders,
      investigationCategorizedEntries.newRadiologyOrders,
      investigationCategorizedEntries.newProcedureOrders,
      investigationCategorizedEntries.completedLabOrders,
      investigationCategorizedEntries.completedRadiologyOrders,
      investigationCategorizedEntries.completedProcedureOrders,
    ],
  );

  const isLoading = isLoadingQueues || isLoadingTotalVisits || isLoadingInvestigations || isLoadingQueueMetrics;
  const isValidating = isValidatingTotalVisits || isValidatingInvestigations || isValidatingQueueMetrics;

  if (isLoading && !isValidating) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  if (!consultationQueues.length) {
    return (
      <EmptyState
        headerTitle={t('mchConsultationQueues', 'MCH Consultation Queues')}
        displayText={t('mchConsultationQueues', 'MCH Consultation Queues')}
      />
    );
  }
  return (
    <>
      <QueueSummaryCards cards={cards} />
      <QueueTab
        queues={consultationQueues}
        navigatePath="mch"
        usePatientChart
        filters={filters}
        onFiltersChanged={setFilters}
      />
    </>
  );
};

export default MCHConsultation;
