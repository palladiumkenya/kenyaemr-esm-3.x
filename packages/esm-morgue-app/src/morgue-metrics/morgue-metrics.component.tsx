import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './morgue-metrics.scss';
import MetricsHeader from './morgue-metrics-header.component';
import MetricsCard from './morgue-card.component';

export interface Service {
  uuid: string;
  display: string;
}

function MorgueMetrics() {
  const { t } = useTranslation();

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricsCard
          label={t('queue', 'Total bodies in queue')}
          value={'0'}
          headerLabel={t('queue', 'Admission Queue')}
        />
        <MetricsCard
          label={t('admitted', 'Total bodies admitted')}
          value={'0'}
          headerLabel={`${t('admitted', 'Admitted Bodies')}:`}></MetricsCard>
        <MetricsCard
          label={t('discharge', 'Total bodies discharged')}
          value={'0'}
          headerLabel={t('discharge', 'Discharge Bodies')}
        />
        <MetricsCard
          label={t('revenue', 'Total  revenue collected')}
          value={'0'}
          headerLabel={t('revenue', 'Revenue')}
        />
      </div>
    </>
  );
}

export default MorgueMetrics;
