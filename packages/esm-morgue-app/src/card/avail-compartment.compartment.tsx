import React from 'react';
import styles from './compartment.scss';
import { Button, Tag, InlineLoading } from '@carbon/react';
import { View } from '@carbon/react/icons';
import { toUpperCase } from '../helpers/expression-helper';
import { ConfigurableLink, usePatient, Visit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import usePerson from '../hook/useMorgue.resource';
import { convertDateToDays } from '../utils/utils';
import capitalize from 'lodash-es/capitalize';

interface AvailableCompartmentProps {
  patientVisitInfo: Visit;
  index: number;
}

const AvailableCompartment: React.FC<AvailableCompartmentProps> = ({ patientVisitInfo, index }) => {
  const { t } = useTranslation();
  const patientUuid = patientVisitInfo?.patient?.uuid;
  const { isLoading, error, person } = usePerson(patientUuid);

  if (isLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        description={t('pullingCompartment', 'Pulling compartments data.....')}
      />
    );
  }

  const daysSpent = convertDateToDays(patientVisitInfo?.startDatetime);
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
          {t('Reason', 'REASON: ')}
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
            to={`\${openmrsSpaBase}/patient/${patientUuid}/chart/deceased-panel`}>
            <View size={20} />
          </ConfigurableLink>
        </span>
      </div>
      <div className={styles.cardRow}>
        <span className={styles.deceasedReason}>
          {t('timeSpent', 'Time spent ')}
          <Tag size="md" type={timeSpentTagType}>
            {daysSpent} {t('days', 'days')}
          </Tag>
        </span>
      </div>
    </div>
  );
};

export default AvailableCompartment;
