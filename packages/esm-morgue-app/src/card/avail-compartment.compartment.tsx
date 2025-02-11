import { Tag } from '@carbon/react';
import { View } from '@carbon/react/icons';
import { ConfigurableLink } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toUpperCase } from '../helpers/expression-helper';
import usePerson from '../hook/useMorgue.resource';
import styles from './compartment.scss';

interface AvailableCompartmentProps {
  patientInfo: any;
  bedNumber: string;
}

const getUuids = (patientInfo) => ({
  personUuid: patientInfo?.person?.uuid || null,
  patientUuid: patientInfo?.uuid || null,
});

const AvailableCompartment: React.FC<AvailableCompartmentProps> = ({ patientInfo, bedNumber }) => {
  const { personUuid, patientUuid } = getUuids(patientInfo);
  const { t } = useTranslation();
  const { isLoading, error, person } = usePerson(personUuid);

  const causeOfDeathDisplay = person?.causeOfDeath?.display;

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

  return (
    <div className={styles.cardView}>
      <div className={styles.cardRow}>
        <div className={styles.cardLabelWrapper}>
          <div className={styles.cardLabel}>{bedNumber}</div>
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
    </div>
  );
};

export default AvailableCompartment;
