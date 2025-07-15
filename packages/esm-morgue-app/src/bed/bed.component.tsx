import React from 'react';
import { Layer, OverflowMenu, OverflowMenuItem, Tag, Tile } from '@carbon/react';
import styles from './bed.scss';
import { useTranslation } from 'react-i18next';
import { Tag as TagIcon } from '@carbon/react/icons';
import capitalize from 'lodash-es/capitalize';
import startCase from 'lodash-es/startCase';
import { formatDateTime, convertDateToDays } from '../utils/utils';
import { useVisit } from '@openmrs/esm-framework';

interface BedProps {
  bedNumber?: string;
  patientName: string;
  gender: string;
  age: number;
  bedType?: string;
  causeOfDeath: string;
  dateOfDeath: string;
  patientUuid: string; // Added patientUuid prop
  onAdmit?: () => void;
  onCancel?: () => void;
}

const BedCard: React.FC<BedProps> = ({
  bedNumber,
  patientName,
  gender,
  age,
  causeOfDeath,
  bedType,
  dateOfDeath,
  patientUuid,
  onAdmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { activeVisit } = useVisit(patientUuid);

  const lengthOfStay = activeVisit?.startDatetime
    ? convertDateToDays(activeVisit.startDatetime)
    : calculateDaysAdmitted(dateOfDeath);

  const isAdmitted = !!activeVisit;
  const timeSpentTagType = lengthOfStay > 7 ? 'red' : lengthOfStay > 3 ? 'magenta' : 'green';

  function calculateDaysAdmitted(dateOfDeath: string): number {
    if (!dateOfDeath) {
      return 0;
    }
    const deathDate = new Date(dateOfDeath);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - deathDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }

  return (
    <Layer className={`${styles.cardWithChildren} ${styles.container}`}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.tagContainer}>
            {bedNumber ? (
              <Tag type="cool-gray" className={styles.bedNumberTag}>
                {bedNumber}
              </Tag>
            ) : (
              <Tag type="cool-gray" className={styles.bedNumberTag}>
                {t('awaiting', 'Awaiting')}
              </Tag>
            )}
            <TagIcon className={styles.tagIcon} />
          </div>
          <div>
            {bedType ? <Tag type="green">{startCase(bedType)}</Tag> : null}
            <OverflowMenu flipped>
              <OverflowMenuItem onClick={onAdmit} itemText={t('admitBody', 'Admit')} disabled={!onAdmit} />
            </OverflowMenu>
          </div>
        </div>

        <div className={styles.patientInfoRow}>
          <span className={styles.patientName}>{capitalize(patientName)}</span>
          <span className={styles.middot}>•</span>
          <span className={styles.gender}>{gender}</span>
          <span className={styles.middot}>•</span>
          <span className={styles.age}>{age}</span>
          <span className={styles.ageUnit}>{t('yearsOld', 'Yrs old')}</span>
        </div>

        <div className={styles.causeOfDeathRow}>
          <span className={styles.causeLabel}>{t('causeOfDeath', 'Cause of death')}</span>
          <span className={styles.causeValue}>{startCase(causeOfDeath)}</span>
        </div>
        <div className={styles.patientInfoRow}>
          <span className={styles.causeLabel}>{t('dateQueued', 'Date queued')}</span>
          <span className={styles.causeValue}>{formatDateTime(dateOfDeath)}</span>
        </div>
        {isAdmitted && (
          <div className={styles.patientInfoRow}>
            <span className={styles.causeLabel}>{t('admissionDate', 'Admission Date')}</span>
            <span className={styles.causeValue}>
              {activeVisit?.startDatetime ? formatDateTime(activeVisit.startDatetime) : '-'}
            </span>
          </div>
        )}
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
            {isAdmitted && <Tag type={'green'}>{t('admitted', 'Admitted')}</Tag>}
          </div>
        </div>
      </Tile>
    </Layer>
  );
};

export default BedCard;
