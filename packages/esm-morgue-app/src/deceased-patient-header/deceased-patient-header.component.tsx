import { Tile } from '@carbon/react';
import { PatientPhoto, usePatient } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDeceasedName } from '../utils/utils';
import styles from './deceased-patient-header.scss';
import { EnhancedPatient, type MortuaryPatient } from '../types';

interface DeceasedPatientHeaderProps {
  patient: EnhancedPatient;
}
export const DeceasedPatientHeader: React.FC<DeceasedPatientHeaderProps> = ({ patient: patientData }) => {
  const { t } = useTranslation();

  return (
    <Tile>
      <div className={styles.patientHeader}>
        <div className={styles.patientInfo}>
          <span className={styles.patientName}>{patientData?.person?.display}</span>
          <div className={styles.patientDetails}>
            <span className={styles.gender}>{patientData?.person?.gender}</span>
            <span className={styles.middot}>•</span>
            <span className={styles.age}>{patientData?.person?.age}</span>
            <span className={styles.ageUnit}>{t('yearsOld', 'Yrs old')}</span>
          </div>
        </div>
      </div>
    </Tile>
  );
};
