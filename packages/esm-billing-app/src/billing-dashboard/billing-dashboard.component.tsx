import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import BillingHeader from '../billing-header/billing-header.component';
import MetricsCards from '../metrics-cards/metrics-cards.component';
import styles from './billing-dashboard.scss';

export function BillingDashboard() {
  const { t } = useTranslation();

  return (
    <>
      <BillingHeader title={t('home', 'Home')} />

      <MetricsCards />

      <main className={styles.container}>
        <Layer>
          <Tile className={styles.tile}>
            <div className={styles.illo}>
              <EmptyDataIllustration />
            </div>
            <p className={styles.content}>{t('noBillingRecords', 'There are no billing records to display')}</p>
          </Tile>
        </Layer>
      </main>
    </>
  );
}
