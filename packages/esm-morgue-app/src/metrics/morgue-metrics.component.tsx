import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './morgue-metrics.scss';
import MetricsCard from './morgue-card.component';

function MorgueMetrics() {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricsCard
          label={t('queue', 'Total bodies in queue')}
          value={'0'}
          headerLabel={t('queue', 'Admission Queue')}
        />
        <MetricsCard
          label={t('admitted', 'Total bodies admitted')}
          value={'0'}
          headerLabel={`${t('admitted', 'Admitted Bodies')}:`}
        />
        <MetricsCard
          label={t('discharge', 'Total bodies discharged')}
          value={'0'}
          headerLabel={t('discharge', 'Discharge Bodies')}
        />
      </div>
    </>
  );
}

export default MorgueMetrics;
