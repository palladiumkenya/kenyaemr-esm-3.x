import React from 'react';
import styles from './no-patient-selected.scss';
import { Tile, Layer } from '@carbon/react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

export const NoPatientSelectedState = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.wrapper}>
      <Layer className={styles.emptyStateContainer}>
        <Tile className={styles.tile}>
          <div className={styles.illo}>
            <EmptyDataIllustration />
          </div>
          <p className={styles.content}>{t('notSearchedState', 'Please search for a patient in the input above')}</p>
        </Tile>
      </Layer>
    </div>
  );
};
