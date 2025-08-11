import React from 'react';
import { useTranslation } from 'react-i18next';
import { type EnhancedPatient } from '../../types';
import capitalize from 'lodash-es/capitalize';
import startCase from 'lodash-es/startCase';
import { formatDateTime } from '../../utils/utils';
import styles from '../bed.scss';

interface PatientInfoProps {
  patient: EnhancedPatient;
}

const DeceasedPatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.patientInfoRow}>
        <span className={styles.patientName}>{capitalize(patient.person.display)}</span>
        <span className={styles.middot}>•</span>
        <span className={styles.gender}>{patient.person.gender}</span>
        <span className={styles.middot}>•</span>
        <span className={styles.age}>{patient.person.age}</span>
        <span className={styles.ageUnit}>{t('yearsOld', 'Yrs old')}</span>
      </div>

      <div className={styles.causeOfDeathRow}>
        <span className={styles.causeLabel}>{t('causeOfDeath', 'Cause of death')}</span>
        <span className={styles.causeValue}>{startCase(patient.person.causeOfDeath?.display || '')}</span>
      </div>

      <div className={styles.patientInfoRow}>
        <span className={styles.causeLabel}>{t('dateOfDeath', 'Date of death')}</span>
        <span className={styles.causeValue}>{formatDateTime(patient.person.deathDate)}</span>
      </div>

      {patient.visitInfo?.admissionDate && (
        <div className={styles.patientInfoRow}>
          <span className={styles.causeLabel}>{t('admissionDate', 'Admission Date')}</span>
          <span className={styles.causeValue}>{formatDateTime(patient.visitInfo.admissionDate)}</span>
        </div>
      )}
    </>
  );
};

export default DeceasedPatientInfo;
