import React from 'react';
import { Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { usePatientFlags } from '../hooks/usePatientFlags';
import styles from './patient-flags.scss';

interface PatientFlagsProps {
  patientUuid: string;
}

const PatientFlags: React.FC<PatientFlagsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { patientFlags, error } = usePatientFlags(patientUuid);

  if (error) {
    return <span>{t('errorPatientFlags', 'Error loading patient flags')}</span>;
  }

  return (
    <div className={styles.flagContainer}>
      {patientFlags.map((patientFlag) => (
        <Tag className={styles.tag} key={patientFlag} type="magenta">
          {patientFlag}
        </Tag>
      ))}
    </div>
  );
};

export default PatientFlags;
