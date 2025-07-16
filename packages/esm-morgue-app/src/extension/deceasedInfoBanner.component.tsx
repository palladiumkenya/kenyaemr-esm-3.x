import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, navigate, usePatient, useVisit } from '@openmrs/esm-framework';
import { Movement, Return, ShareKnowledge } from '@carbon/react/icons';
import React from 'react';
import styles from './actionButton.scss';
import { convertDateToDays, formatDateTime } from '../utils/utils';
import { Console } from '@carbon/pictograms-react';
import { type Visit } from '../types';

interface BannerInfoProps {
  patientUuid: string;
  visit: Visit;
  bedNumber?: string;
}

const BannerInfo: React.FC<BannerInfoProps> = ({ patientUuid, visit, bedNumber }) => {
  const { t } = useTranslation();
  const { patient } = usePatient(patientUuid);

  const timeAndDateOfDeath = patient?.deceasedDateTime;

  const startDate = visit?.startDatetime;

  const lengthOfStay = `${convertDateToDays(startDate)} ${
    convertDateToDays(startDate) === 1 ? t('day', 'Day') : t('days', 'Days')
  }`;

  return (
    <div className={styles.metricList}>
      <div className={styles.metrics}>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('dateOfAdmission', 'Date of admission')}</span>
          <span className={styles.metricValue}>{formatDateTime(startDate)}</span>
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('dateAndTimeofDeath', 'Date and time of death')}</span>{' '}
          <span className={styles.metricValue}>{formatDateTime(timeAndDateOfDeath)}</span>
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('lengthofStay', 'Length of stay')}</span>
          <span className={styles.metricValue}>{lengthOfStay}</span>
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('compartment', 'Compartment')}</span>
          <span className={styles.metricValue}>{bedNumber}</span>
        </div>
      </div>
    </div>
  );
};

export default BannerInfo;
