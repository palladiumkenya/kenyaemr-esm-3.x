import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import styles from './billing-dashboard.scss';
import BillingHeader from './billing-header/billing-header.component';
import { useTranslation } from 'react-i18next';

export function BillingDashboard() {
  const { t } = useTranslation();

  return (
    <>
      <BillingHeader title={t('billing', 'Billing')} />
      <Layer className={styles.emptyStateContainer}>
        <Tile className={styles.tile}>
          <div className={styles.illo}>
            <EmptyDataIllustration />
          </div>
          <p className={styles.content}>{t('noBillingRecords', 'There are no billing records to display')}</p>
        </Tile>
      </Layer>
    </>
  );
}
