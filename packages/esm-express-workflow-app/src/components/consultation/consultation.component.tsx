import { InlineLoading } from '@carbon/react';
import { ExtensionSlot, HomePictogram, PageHeader, PageHeaderContent, useConfig } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpressWorkflowConfig } from '../../config-schema';
import { useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import QueueSummaryCards, { QueueSummaryCard } from '../../shared/queue/queue-summary-cards.component';
import { Queue, QueueFilter } from '../../types';
import { useConsultationQueueMetrics, useInvestigationStats, useTotalVisits } from './consultation.resource';
import { buildConsultationCards } from './consultation.utils';
import styles from './consultation.scss';

type ConsultationProps = {
  dashboardTitle: string;
};

const Consultation: React.FC<ConsultationProps> = ({ dashboardTitle }) => {
  const { t } = useTranslation();
  const {
    priorities: { emergencyPriorityConceptUuid, urgentPriorityConceptUuid, notUrgentPriorityConceptUuid },
    queueServiceConceptUuids,
  } = useConfig<ExpressWorkflowConfig>();
  const [currQueue, setCurrQueue] = useState<Queue>();
  const { queues, isLoading: isLoadingQueues, isValidating: isValidatingQueues } = useQueues();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const consultationQueues = queues.filter(
    (queue) =>
      queue.service.uuid === queueServiceConceptUuids.consultationService &&
      !queue.location.display.toLowerCase().includes('mch') &&
      queue?.queueRooms?.length > 0,
  );
  const activeQueue = useMemo(() => currQueue ?? consultationQueues[0], [currQueue, consultationQueues]);
  const {
    waitingEntries,
    isLoading: isLoadingQueueMetrics,
    isValidating: isValidatingQueueMetrics,
    emergencyEntries,
    urgentEntries,
    notUrgentEntries,
  } = useConsultationQueueMetrics(activeQueue);
  const { data: totalVisits, isLoading: isLoadingTotalVisits } = useTotalVisits();

  // Use the updated investigation stats hook with single refresh function
  const {
    awaitingCount,
    completedCount,
    lab,
    radiology,
    procedures,
    isLoading: isLoadingInvestigations,
    refresh: refreshInvestigations,
    investigationCategorizedEntries,
  } = useInvestigationStats(activeQueue);
  const [filters, setFilters] = useState<Array<QueueFilter>>([]);
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
    () =>
      buildConsultationCards({
        t,
        waitingCount: waitingEntries.length,
        emergencyCount: emergencyEntries.length,
        urgentCount: urgentEntries.length,
        notUrgentCount: notUrgentEntries.length,
        awaitingCount,
        completedCount,
        labAwaiting: lab.awaiting,
        labCompleted: lab.completed,
        radiologyAwaiting: radiology.awaiting,
        radiologyCompleted: radiology.completed,
        proceduresAwaiting: procedures.awaiting,
        proceduresCompleted: procedures.completed,
        isRefreshing,
        isLoadingInvestigations,
        onRefreshInvestigations: handleRefresh,
        totalVisitsCount: totalVisits?.length,
        setFilters,
        emergencyPriorityConceptUuid,
        urgentPriorityConceptUuid,
        notUrgentPriorityConceptUuid,
        investigationCategorizedEntries,
      }),
    [
      t,
      waitingEntries.length,
      emergencyEntries.length,
      urgentEntries.length,
      notUrgentEntries.length,
      awaitingCount,
      completedCount,
      lab.awaiting,
      lab.completed,
      radiology.awaiting,
      radiology.completed,
      procedures.awaiting,
      procedures.completed,
      isRefreshing,
      isLoadingInvestigations,
      handleRefresh,
      totalVisits?.length,
      emergencyPriorityConceptUuid,
      urgentPriorityConceptUuid,
      notUrgentPriorityConceptUuid,
      investigationCategorizedEntries,
    ],
  );

  const isLoading =
    (isLoadingQueues || isLoadingQueueMetrics || isLoadingTotalVisits || isLoadingInvestigations) &&
    !isValidatingQueues &&
    !isValidatingQueueMetrics;

  if (isLoading) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  return (
    <div className={`omrs-main-content`}>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />
        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>
      <QueueSummaryCards cards={cards} />
      <QueueTab
        queues={consultationQueues}
        navigatePath="consultation"
        usePatientChart
        filters={filters}
        onFiltersChanged={setFilters}
        onTabChanged={setCurrQueue}
      />
    </div>
  );
};

export default Consultation;
