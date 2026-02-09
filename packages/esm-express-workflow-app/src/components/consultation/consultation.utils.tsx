import React from 'react';
import { IconButton, InlineLoading } from '@carbon/react';
import { Renew } from '@carbon/react/icons';
import type { TFunction } from 'react-i18next';
import type { QueueSummaryCard } from '../../shared/queue/queue-summary-cards.component';
import type { QueueFilter, QueueEntry } from '../../types';
import styles from './consultation.scss';

type InvestigationCategorizedEntries = {
  newLabOrders: QueueEntry[];
  newRadiologyOrders: QueueEntry[];
  newProcedureOrders: QueueEntry[];
  completedLabOrders: QueueEntry[];
  completedRadiologyOrders: QueueEntry[];
  completedProcedureOrders: QueueEntry[];
};

type BuildConsultationCardsParams = {
  t: TFunction;
  waitingCount: number;
  emergencyCount: number;
  urgentCount: number;
  notUrgentCount: number;
  awaitingCount: number;
  completedCount: number;
  labAwaiting: number;
  labCompleted: number;
  radiologyAwaiting: number;
  radiologyCompleted: number;
  proceduresAwaiting: number;
  proceduresCompleted: number;
  isRefreshing: boolean;
  isLoadingInvestigations: boolean;
  onRefreshInvestigations: () => void;
  totalVisitsCount?: number;
  setFilters: React.Dispatch<React.SetStateAction<QueueFilter[]>>;
  emergencyPriorityConceptUuid: string;
  urgentPriorityConceptUuid: string;
  notUrgentPriorityConceptUuid: string;
  investigationCategorizedEntries: InvestigationCategorizedEntries;
};

export function buildConsultationCards({
  t,
  waitingCount,
  emergencyCount,
  urgentCount,
  notUrgentCount,
  awaitingCount,
  completedCount,
  labAwaiting,
  labCompleted,
  radiologyAwaiting,
  radiologyCompleted,
  proceduresAwaiting,
  proceduresCompleted,
  isRefreshing,
  isLoadingInvestigations,
  onRefreshInvestigations,
  totalVisitsCount,
  setFilters,
  emergencyPriorityConceptUuid,
  urgentPriorityConceptUuid,
  notUrgentPriorityConceptUuid,
  investigationCategorizedEntries,
}: BuildConsultationCardsParams): Array<QueueSummaryCard> {
  return [
    {
      title: t('awaitingConsultation', 'Awaiting consultation'),
      value: waitingCount.toString(),
      categories: [
        {
          label: t('emergency', 'Emergency'),
          value: emergencyCount,
          onClick: () => {
            setFilters((prevFilters) => [
              ...prevFilters.filter((f) => f.key !== 'priority'),
              { key: 'priority', value: emergencyPriorityConceptUuid, label: t('emergency', 'Emergency') },
            ]);
          },
        },
        {
          label: t('urgent', 'Urgent'),
          value: urgentCount,
          onClick: () => {
            setFilters((prevFilters) => [
              ...prevFilters.filter((f) => f.key !== 'priority'),
              { key: 'priority', value: urgentPriorityConceptUuid, label: t('urgent', 'Urgent') },
            ]);
          },
        },
        {
          label: t('notUrgent', 'Not Urgent'),
          value: notUrgentCount,
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
          value: labAwaiting,
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
          value: radiologyAwaiting,
          onClick: () => {
            setFilters((prevFilters) => [
              ...prevFilters.filter((f) => f.key !== 'service_awaiting'),
              {
                key: 'service_awaiting',
                value: investigationCategorizedEntries.newRadiologyOrders.map((entry) => entry.patient.uuid).join(','),
                label: t('radiologyAwaiting', 'Radiology Awaiting'),
              },
            ]);
          },
        },
        {
          label: t('procedures', 'Procedures'),
          value: proceduresAwaiting,
          onClick: () => {
            setFilters((prevFilters) => [
              ...prevFilters.filter((f) => f.key !== 'service_awaiting'),
              {
                key: 'service_awaiting',
                value: investigationCategorizedEntries.newProcedureOrders.map((entry) => entry.patient.uuid).join(','),
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
            onClick={onRefreshInvestigations}
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
          value: labCompleted,
          onClick: () => {
            setFilters((prevFilters) => [
              ...prevFilters.filter((f) => f.key !== 'service_completed'),
              {
                key: 'service_completed',
                value: investigationCategorizedEntries.completedLabOrders.map((entry) => entry.patient.uuid).join(','),
                label: t('labCompleted', 'Lab Completed'),
              },
            ]);
          },
        },
        {
          label: t('radiology', 'Radiology'),
          value: radiologyCompleted,
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
          value: proceduresCompleted,
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
      value: totalVisitsCount?.toString() ?? '0',
    },
  ];
}
