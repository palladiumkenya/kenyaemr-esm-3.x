import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './relationships-metrics.scss';
import MetricsHeader from './relationships-metrics-header.component';
import MetricsCard from './relationships-card.component';

export interface Service {
  uuid: string;
  display: string;
}

function PharmacyMetrics() {
  const { t } = useTranslation();

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricsCard
          label={t('pharmacies', 'Total community phamacies')}
          value={'0'}
          headerLabel={t('pharmacies', 'Phamacies')}
        />
        <MetricsCard
          label={t('tagged', 'Total tagged pharmacies')}
          value={'0'}
          headerLabel={`${t('tagged', 'Tagged phamacies')}:`}></MetricsCard>
        <MetricsCard
          label={t('patient', 'Total assigned patients')}
          value={'0'}
          headerLabel={t('patient', 'Assigned patients')}
        />
        <MetricsCard
          label={t('users', 'Total   assigned users')}
          value={'0'}
          headerLabel={t('users', 'Assigned Users')}
        />
      </div>
    </>
  );
}

export default PharmacyMetrics;
