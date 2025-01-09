import React from 'react';
import styles from './compartment.scss';
import { Button, Tag, InlineLoading } from '@carbon/react';
import { View } from '@carbon/react/icons';
import { toUpperCase } from '../helpers/expression-helper';
import { ConfigurableLink, ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { convertDateToDays } from '../utils/utils';
import capitalize from 'lodash-es/capitalize';
import { DeceasedInfo } from '../types';
import usePerson, { useActiveMorgueVisit } from '../hook/useMorgue.resource';

interface AvailableCompartmentProps {
  patientInfo: DeceasedInfo;
  index: number;
}

const AvailableCompartment: React.FC<AvailableCompartmentProps> = ({ patientInfo, index }) => {
  const { t } = useTranslation();
  const { isLoading, error, person } = usePerson(patientInfo?.person?.uuid);
  const {
    data: activeDeceased,
    error: isActiveError,
    isLoading: isActiveLoading,
  } = useActiveMorgueVisit(patientInfo?.person?.uuid);

  const startVisitDate = activeDeceased?.[0]?.startDatetime;

  if (isLoading || isActiveLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        description={t('pullingCompartment', 'Pulling compartments data.....')}
      />
    );
  }

  if (error || isActiveError) {
    return <ErrorState error={error} headerTitle={t('allocation', 'Allocation')} />;
  }

  const daysSpent = convertDateToDays(startVisitDate);
  const timeSpentTagType = daysSpent > 17 ? 'red' : 'blue';

  const causeOfDeathDisplay = person?.causeOfDeath?.display;
  const causeOfDeathTagType = causeOfDeathDisplay?.toLowerCase() === 'unknown' ? 'red' : 'undefined';

  return (
    <div className={styles.cardView}>
      <div className={styles.cardRow}>
        <div className={styles.cardLabelWrapper}>
          <div className={styles.cardLabel}>{index + 1}</div>
        </div>
        <span className={styles.deceasedName}>
          {toUpperCase(person?.display)}
          <span className={styles.middot}>&middot;</span>
          <span className={styles.age}>{person?.age} Yrs</span>
        </span>
      </div>
      <div className={styles.cardRow}>
        <span className={styles.deceasedReason}>
          {t('Reason', 'Reason ')}
          {causeOfDeathTagType === 'red' ? (
            <Tag size="md" type={causeOfDeathTagType}>
              {causeOfDeathDisplay}
            </Tag>
          ) : (
            <span className={styles.causeDisplay}>{capitalize(causeOfDeathDisplay)}</span>
          )}
        </span>
        <span className={styles.viewDetails}>
          <ConfigurableLink
            className={styles.viewDetailsLink}
            to={`\${openmrsSpaBase}/patient/${patientInfo?.person?.uuid}/chart/deceased-panel`}>
            <View size={20} />
          </ConfigurableLink>
        </span>
      </div>
      <div className={styles.borderLine}></div>
      <div className={styles.cardRow}>
        <span className={styles.deceasedReason}>
          {t('timeSpent', 'Time spent ')}
          <Tag size="md" type={timeSpentTagType}>
            {daysSpent} {t('days', 'days')}
          </Tag>
        </span>
        <Tag size="md" type="green">
          {patientInfo?.status}
        </Tag>
      </div>
    </div>
  );
};

export default AvailableCompartment;
