import { InlineLoading } from '@carbon/react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueueEntries, useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useInvestigationStats, useQueuePriorityCounts, useTotalVisits } from '../consultation/consultation.resource';
import { ExpressWorkflowConfig } from '../../config-schema';
import { useConfig } from '@openmrs/esm-framework';
import { QueueFilter } from '../../types';

const MCHConsultation: React.FC = () => {
  const { t } = useTranslation();
  const { queues, isLoading, error } = useQueues();
  const [filters, setFilters] = useState<Array<QueueFilter>>([]);

  const {
    priorities: { emergencyPriorityConceptUuid, urgentPriorityConceptUuid, notUrgentPriorityConceptUuid },
    queueServiceConceptUuids,
  } = useConfig<ExpressWorkflowConfig>();
  const { data: totalVisits, isLoading: isLoadingTotalVisits } = useTotalVisits();
  const { awaitingCount, completedCount, totalCount, isLoading: isLoadingInvestigations } = useInvestigationStats();

  const consultationQueues = queues.filter(
    (queue) =>
      queue.service.uuid === queueServiceConceptUuids.consultationService &&
      queue.location.display.toLowerCase().includes('mch') &&
      queue?.queueRooms?.length > 0,
  );

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

  if (!consultationQueues.length) {
    return (
      <EmptyState
        headerTitle={t('mchConsultationQueues', 'MCH Consultation Queues')}
        displayText={t('mchConsultationQueues', 'MCH Consultation Queues')}
      />
    );
  }
  return (
    <QueueTab
      queues={consultationQueues}
      navigatePath="mch"
      cards={cards}
      usePatientChart
      filters={filters}
      onFiltersChanged={setFilters}
    />
  );
};

export default MCHConsultation;
