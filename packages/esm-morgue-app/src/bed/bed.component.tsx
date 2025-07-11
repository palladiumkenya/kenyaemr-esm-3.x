import React from 'react';
import { Layer, OverflowMenu, OverflowMenuItem, Tag, Tile } from '@carbon/react';
import styles from './bed.scss';
import { useTranslation } from 'react-i18next';
import { Tag as TagIcon } from '@carbon/react/icons';
import capitalize from 'lodash-es/capitalize';
import startCase from 'lodash-es/startCase';
import { formatDateTime } from '../utils/utils';

interface BedProps {
  bedNumber?: string;
  patientName: string;
  gender: string;
  age: number;
  causeOfDeath: string;
  dateOfDeath: string;
  onAdmit?: () => void;
  onCancel?: () => void;
}

const BedCard: React.FC<BedProps> = ({
  bedNumber,
  patientName,
  gender,
  age,
  causeOfDeath,
  dateOfDeath,
  onAdmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <Layer className={`${styles.cardWithChildren} ${styles.container}`}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.tagContainer}>
            <Tag type="cool-gray">{t('awaiting', 'Awaiting')}</Tag>
            <TagIcon className={styles.tagIcon} />
          </div>
          <OverflowMenu flipped>
            <OverflowMenuItem onClick={onAdmit} itemText={t('admitBody', 'Admit')} disabled={!onAdmit} />
            <OverflowMenuItem onClick={onCancel} itemText={t('cancel', 'Cancel')} disabled={!onCancel} />
          </OverflowMenu>
        </div>

        {bedNumber && (
          <div className={styles.bedNumberRow}>
            <span className={styles.bedLabel}>{t('bedNumber', 'Bed #')}</span>
            <span className={styles.bedNumber}>{bedNumber}</span>
          </div>
        )}

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
      </Tile>
    </Layer>
  );
};

export default BedCard;
