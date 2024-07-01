import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './case-management-metrics.scss';
import MetricsHeader from './case-management-header.component';
import MetricsCard from './case-management-card.component';

function CaseMetric() {
  const { t } = useTranslation();

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer} data-testid="financial-metrics">
        <MetricsCard
          label={t('activeCase', 'Total active cases')}
          value={'0'}
          headerLabel={t('activeCase', 'Active cases')}
        />
        <MetricsCard
          label={t('discontinuationCase', 'Total discontinuation cases')}
          value={'0'}
          headerLabel={t('discontinuationCase', 'Discontinuation cases')}
        />

        <MetricsCard label={t('caseTotal', 'Total  cases')} value={'0'} headerLabel={t('caseTotal', 'Total  cases')} />
      </div>
    </>
  );
}

export default CaseMetric;
