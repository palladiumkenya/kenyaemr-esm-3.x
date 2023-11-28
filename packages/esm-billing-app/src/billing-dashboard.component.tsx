import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import styles from './billing-dashboard.scss';

export function BillingDashboard() {
  return (
    <Layer className={styles.emptyStateContainer}>
      <Tile className={styles.tile}>
        <div className={styles.illo}>
          <EmptyDataIllustration />
        </div>
        <p className={styles.content}>There are no billing records to display.</p>
      </Tile>
    </Layer>
  );
}
