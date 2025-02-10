import React from 'react';
import styles from './compartment.scss';
import { Button, Tag, InlineLoading } from '@carbon/react';
import { View } from '@carbon/react/icons';
import { toUpperCase } from '../helpers/expression-helper';
import { ConfigurableLink, ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { convertDateToDays } from '../utils/utils';
import capitalize from 'lodash-es/capitalize';
import { DeceasedInfo, mortuaryLocationFetchResponse } from '../types';
import usePerson, { useActiveMorgueVisit } from '../hook/useMorgue.resource';

interface AvailableCompartmentProps {
  patientInfo: any; // Update this type to match the patient object structure
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
