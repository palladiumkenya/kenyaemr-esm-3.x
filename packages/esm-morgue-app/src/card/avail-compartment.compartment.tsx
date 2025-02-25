import { Tag } from '@carbon/react';
import { View } from '@carbon/react/icons';
import { ConfigurableLink, useVisit } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toUpperCase } from '../helpers/expression-helper';
import { Patient } from '../types';
import { convertDateToDays } from '../utils/utils';
import styles from './compartment.scss';

interface AvailableCompartmentProps {
  patientInfo: Patient;
  bedNumber: string;
}

const getPatientAndPersionUuid = (patientInfo) => ({
  personUuid: patientInfo?.person?.uuid || null,
  patientUuid: patientInfo?.uuid || null,
});

const AvailableCompartment: React.FC<AvailableCompartmentProps> = ({ patientInfo, bedNumber }) => {
  const { personUuid, patientUuid } = getPatientAndPersionUuid(patientInfo);
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);

  const causeOfDeathDisplay = patientInfo?.person?.causeOfDeath?.display;

  const causeOfDeathMessage = causeOfDeathDisplay
    ? causeOfDeathDisplay.toLowerCase() === 'unknown'
      ? causeOfDeathDisplay
      : capitalize(causeOfDeathDisplay)
    : '--';

  const causeOfDeathTagType = causeOfDeathDisplay
    ? causeOfDeathDisplay.toLowerCase() === 'unknown'
      ? 'red'
      : 'undefined'
    : 'undefined';

  const startDate = currentVisit?.startDatetime;

  const lengthOfStay = `${convertDateToDays(startDate)} ${
    convertDateToDays(startDate) === 1 ? t('day', 'Day') : t('days', 'Days')
  }`;
  const lengthOfStayDays = parseInt(lengthOfStay.match(/\d+/)?.[0] || '0', 10);
  const timeSpentTagType = lengthOfStayDays > 17 ? 'red' : 'blue';
  return (
    <div className={styles.cardView}>
      <div className={styles.cardRow}>
        <div className={styles.cardLabelWrapper}>
          <div className={styles.cardLabel}>{bedNumber}</div>
        </div>
        <span className={styles.deceasedName}>
          {toUpperCase(patientInfo?.person?.display)}
          <span className={styles.middot}>&middot;</span>
          <span className={styles.age}>{patientInfo?.person?.age} Yrs</span>
        </span>
      </div>
      <div className={styles.cardRow}>
        <span className={styles.deceasedReason}>
          {t('Reason', 'Reason ')}
          {causeOfDeathTagType === 'red' ? (
            <Tag size="md" type={causeOfDeathTagType}>
              {causeOfDeathMessage}
            </Tag>
          ) : (
            <span className={styles.causeDisplay}>{causeOfDeathMessage}</span>
          )}
        </span>
        <span className={styles.viewDetails}>
          <ConfigurableLink
            className={styles.viewDetailsLink}
            to={`\${openmrsSpaBase}/patient/${patientUuid}/chart/deceased-panel`}>
            <View size={20} />
          </ConfigurableLink>
        </span>
      </div>
      <div className={styles.borderLine}></div>
      <div className={styles.cardRow}>
        <span className={styles.deceasedReason}>
          {t('timeSpent', 'Time spent ')}
          <Tag size="md" type={timeSpentTagType}>
            {lengthOfStay}
          </Tag>
        </span>
      </div>
    </div>
  );
};

export default AvailableCompartment;
