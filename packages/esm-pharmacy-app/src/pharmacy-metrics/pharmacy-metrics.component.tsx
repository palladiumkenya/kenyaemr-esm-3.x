import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './pharmacy-metrics.scss';
import MetricsHeader from './pharmacy-metrics-header.component';
import MetricsCard from './pharmacy-card.component';
import { usePharmacies } from '../hooks';
import { useSession } from '@openmrs/esm-framework';

export interface Service {
  uuid: string;
  display: string;
}

function PharmacyMetrics() {
  const { t } = useTranslation();
  const {
    user: { uuid: userUuid },
  } = useSession();
  const { pharmacies, isLoading } = usePharmacies(userUuid);

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <div style={{ maxWidth: '400px', minWidth: '350px' }}>
          <MetricsCard
            label={t('pharmacies', 'Total community phamacies')}
            value={pharmacies.length}
            headerLabel={t('pharmacies', 'Phamacies')}
          />
        </div>
        {/* <MetricsCard
          label={t('patient', 'Total assigned patients')}
          value={'0'}
          headerLabel={t('patient', 'Assigned patients')}
        />
        <MetricsCard
          label={t('users', 'Total   assigned users')}
          value={'0'}
          headerLabel={t('users', 'Assigned Users')}
        /> */}
      </div>
    </>
  );
}

export default PharmacyMetrics;
