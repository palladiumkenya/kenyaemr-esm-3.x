import React from 'react';
import { Tag } from '@carbon/react';
import styles from '../bed.scss';
import { useTranslation } from 'react-i18next';
import { type EnhancedPatient } from '../../types';
import { type Visit } from '@openmrs/esm-framework/src';
interface PatientStatusFooterProps {
  patient: EnhancedPatient;
  isAdmitted: boolean;
  lengthOfStay: number;
  timeSpentTagType: 'red' | 'magenta' | 'green';
  activeVisit: Visit;
}

const DeceasedPatientStatusFooter: React.FC<PatientStatusFooterProps> = ({
  patient,
  isAdmitted,
  lengthOfStay,
  timeSpentTagType,
  activeVisit,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.borderLine}></div>
      <div className={styles.cardRow}>
        <span className={styles.causeLabel}>
          {isAdmitted ? t('timeSpent', 'Time spent') : t('daysInMortuary', 'Days in mortuary')}
        </span>
        <div className={styles.tagsContainer}>
          <Tag size="md" type={timeSpentTagType}>
            <span className={styles.causeLabel}>{lengthOfStay}</span>{' '}
            {lengthOfStay === 1 ? t('day', 'Day') : t('days', 'Days')}
          </Tag>
          {isAdmitted && !patient.isDischarged && <Tag type="green">{t('admitted', 'Admitted')}</Tag>}
        </div>
      </div>
    </>
  );
};

export default DeceasedPatientStatusFooter;
