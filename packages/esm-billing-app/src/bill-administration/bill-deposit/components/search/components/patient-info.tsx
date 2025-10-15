import React from 'react';
import { InlineLoading } from '@carbon/react';
import { usePatient, getPatientName, ErrorState } from '@openmrs/esm-framework';
import styles from '../bill-deposit-search.scss';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash-es/capitalize';

interface PatientInfoProps {
  patientUuid: string | null;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { patient, isLoading, error } = usePatient(patientUuid);

  const patientName = patient ? getPatientName(patient) : '--';
  const patientGender = capitalize(patient?.gender ?? '--');
  const patientIdentifier = Array.isArray(patient?.identifier)
    ? patient?.identifier[0]?.value ?? '--'
    : patient?.identifier ?? '--';

  if (isLoading) {
    return <InlineLoading description={t('loading', 'Loading...')} />;
  }
  if (error || !patient) {
    return <ErrorState error={error} headerTitle={t('error', 'Error')} />;
  }

  return (
    <div className={styles.patientInfo}>
      <span className={styles.patientName}>{patientName}</span>
      <span className={styles.patientGender}>• {patientGender} •</span>
      <span className={styles.patientIdentifier}>{patientIdentifier}</span>
    </div>
  );
};

export default PatientInfo;
