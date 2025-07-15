import { Tile } from '@carbon/react';
import { PatientPhoto, usePatient } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDeceasedName } from '../utils/utils';
import styles from './deceased-patient-header.scss';
import { type MortuaryPatient } from '../typess';

interface DeceasedPatientHeaderProps {
  patientData: MortuaryPatient;
}
export const DeceasedPatientHeader: React.FC<DeceasedPatientHeaderProps> = ({ patientData }) => {
  const { t } = useTranslation();

  return (
    <Tile>
      <div className={styles.patientHeader}>
        <PatientPhoto patientUuid={patientData?.patient?.uuid} patientName={patientData?.person?.person?.display} />
        <div className={styles.patientInfo}>
          <span className={styles.patientName}>{patientData?.person?.person?.display}</span>
          <div className={styles.patientDetails}>
            <span className={styles.gender}>{patientData?.person?.person?.gender}</span>
            <span className={styles.middot}>•</span>
            <span className={styles.age}>{patientData?.person?.person?.age}</span>
            <span className={styles.ageUnit}>{t('yearsOld', 'Yrs old')}</span>
          </div>
        </div>
      </div>
    </Tile>
  );
};
