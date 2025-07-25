import React from 'react';
import { Layer, OverflowMenu, OverflowMenuItem, Tag, Tile } from '@carbon/react';
import styles from './bed.scss';
import { useTranslation } from 'react-i18next';
import { Tag as TagIcon } from '@carbon/react/icons';
import capitalize from 'lodash-es/capitalize';
import startCase from 'lodash-es/startCase';
import { formatDateTime, convertDateToDays } from '../utils/utils';
import { ExtensionSlot, useVisit } from '@openmrs/esm-framework';

interface BedProps {
  bedNumber?: string;
  patientName: string;
  gender: string;
  age: number;
  bedType?: string;
  causeOfDeath: string;
  dateOfDeath: string;
  patientUuid: string;
  onAdmit?: () => void;
  onPostmortem?: () => void;
  onDischarge?: () => void;
  onSwapCompartment?: () => void;
  onDispose?: () => void;
  onPrintGatePass?: () => void;
  onViewDetails?: () => void;
  isDischarged?: boolean;
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
  onPostmortem,
  onDischarge,
  onSwapCompartment,
  onDispose,
  onPrintGatePass,
  onViewDetails,
  isDischarged = false,
}) => {
  const { t } = useTranslation();
  const { activeVisit } = useVisit(patientUuid);

  const lengthOfStay = activeVisit?.startDatetime
    ? convertDateToDays(activeVisit.startDatetime)
    : calculateDaysInMortuary(dateOfDeath);

  const isAdmitted = !!activeVisit;
  const timeSpentTagType = lengthOfStay > 7 ? 'red' : lengthOfStay > 3 ? 'magenta' : 'green';

  function calculateDaysInMortuary(dateOfDeath: string): number {
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
            <div className={styles.tagContainer}>
              {bedNumber ? (
                <Tag type="cool-gray" className={styles.bedNumberTag}>
                  {bedNumber}
                </Tag>
              ) : (
                !isDischarged && (
                  <Tag type="cool-gray" className={styles.bedNumberTag}>
                    {t('awaiting', 'Awaiting')}
                  </Tag>
                )
              )}
              {isDischarged && (
                <Tag type="blue" className={styles.statusTag}>
                  {t('discharged', 'Discharged')}
                </Tag>
              )}
              <TagIcon className={styles.tagIcon} />
            </div>
          </div>
          <div>
            {bedType ? <Tag type="green">{startCase(bedType)}</Tag> : null}
            <OverflowMenu flipped>
              {onAdmit && <OverflowMenuItem onClick={onAdmit} itemText={t('admit', 'Admit')} />}
              {onViewDetails && (
                <OverflowMenuItem onClick={onViewDetails} itemText={t('viewDetails', 'View details')} />
              )}
              {isDischarged && (
                <ExtensionSlot
                  name="print-post-mortem-overflow-menu-item-slot"
                  state={{
                    patientUuid: patientUuid,
                  }}
                />
              )}
              {onDischarge && <OverflowMenuItem onClick={onDischarge} itemText={t('discharge', 'Discharge')} />}
              {onSwapCompartment && (
                <OverflowMenuItem onClick={onSwapCompartment} itemText={t('swapCompartment', 'Swap Compartment')} />
              )}
              {onDispose && <OverflowMenuItem onClick={onDispose} itemText={t('dispose', 'Dispose')} />}
              {onPrintGatePass && (
                <OverflowMenuItem onClick={onPrintGatePass} itemText={t('printGatePass', 'Gate Pass')} />
              )}
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
          <span className={styles.causeLabel}>{t('dateOfDeath', 'Date of death')}</span>
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
            {isAdmitted && !isDischarged && <Tag type="green">{t('admitted', 'Admitted')}</Tag>}
          </div>
        </div>
      </Tile>
    </Layer>
  );
};

export default BedCard;
