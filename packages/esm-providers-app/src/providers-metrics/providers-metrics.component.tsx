import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './providers-metrics.scss';
import MetricsHeader from './providers-metrics-header.component';
import MetricsCard from './providers-card.component';
import { UseAllProviders } from '../api/api';

export interface Service {
  uuid: string;
  display: string;
}

function ProviderMetrics() {
  const { t } = useTranslation();
  const { response } = UseAllProviders();

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricsCard
          label={t('totalProviders', 'Total Providers')}
          value={response ? response.length : 0}
          headerLabel={t('all', 'All Providers')}
        />
        <MetricsCard
          label={t('totalActiveProviders', 'Total Active Providers')}
          value={'0'}
          headerLabel={`${t('active', 'Active Providers')}:`}></MetricsCard>
        <MetricsCard
          label={t('totalInActiveProviders', 'Total InActive Providers')}
          value={'0'}
          headerLabel={t('inActiveProviders', 'InActive Providers')}
        />
        <MetricsCard
          label={t('totalLicenseDueRenewal', 'Total with License Due for Renewal')}
          value={'0'}
          headerLabel={t('licenseDue', 'License Due')}
        />
      </div>
    </>
  );
}

export default ProviderMetrics;
