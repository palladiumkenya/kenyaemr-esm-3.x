import { Tile, InlineLoading } from '@carbon/react';
import { ErrorState, PatientPhoto, usePatient } from '@openmrs/esm-framework';
import React from 'react';
import styles from './visit-form-banner.scss';
import { useTranslation } from 'react-i18next';

const VisitFormBanner: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.patientInfo}>
      <div className={styles.patientDetails}>
        <h2 className={styles.patientName}>Fredrick Kilonzo Kioko</h2>
        <div className={styles.demographics}>
          Male
          <span className={styles.middot}>&middot;</span> 26 Yrs
        </div>
      </div>
    </Tile>
  );
};

export default VisitFormBanner;
