import React from 'react';
import {
  DataTableSkeleton,
  ContentSwitcher,
  Switch,
  InlineLoading,
  SkeletonText,
  RadioButtonSkeleton,
} from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink, ErrorState } from '@openmrs/esm-framework';
import styles from './summary.scss';
import MetricsCard from '../metrics/metrics-card.component';

interface SummaryProps {
  awaitingQueueCount: number;
  admittedCount: number;
  dischargedCount: number;
  isLoading?: boolean;
}

const Summary: React.FC<SummaryProps> = ({ awaitingQueueCount, admittedCount, dischargedCount, isLoading = false }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.cardContainer}>
        <MetricsCard
          headerLabel={isLoading ? <RadioButtonSkeleton /> : t('awaitingAdmissionHeader', 'Awaiting Admission')}
          label={isLoading ? <SkeletonText /> : t('totalCount', 'total')}
          value={isLoading ? <InlineLoading /> : awaitingQueueCount.toString()}
        />
        <MetricsCard
          headerLabel={isLoading ? <RadioButtonSkeleton /> : t('admittedHeader', 'Admitted')}
          label={isLoading ? <SkeletonText /> : t('totalCount', 'total')}
          value={isLoading ? <InlineLoading /> : admittedCount.toString()}
        />
        <MetricsCard
          headerLabel={isLoading ? <RadioButtonSkeleton /> : t('dischargedHeader', 'Discharged')}
          label={isLoading ? <SkeletonText /> : t('totalCount', 'total')}
          value={isLoading ? <InlineLoading /> : dischargedCount.toString()}
        />
      </div>
    </>
  );
};

export default Summary;
