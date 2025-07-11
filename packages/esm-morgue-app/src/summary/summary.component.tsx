import React from 'react';
import { DataTableSkeleton, ContentSwitcher, Switch, InlineLoading } from '@carbon/react';
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
          headerLabel={t('awaitingAdmissionHeader', 'Awaiting Admission')}
          label={t('totalCount', 'total')}
          value={isLoading ? <InlineLoading /> : awaitingQueueCount.toString()}
        />
        <MetricsCard
          headerLabel={t('admittedHeader', 'Admitted')}
          label={t('totalCount', 'total')}
          value={admittedCount.toString()}
        />
        <MetricsCard
          headerLabel={t('dischargedHeader', 'Discharged')}
          label={t('totalCount', 'total')}
          value={dischargedCount.toString()}
        />
      </div>
    </>
  );
};

export default Summary;
