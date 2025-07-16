import React from 'react';
import { Layer, OverflowMenu, OverflowMenuItem, Tag, Tile } from '@carbon/react';
import styles from './bed.scss';
import { useTranslation } from 'react-i18next';
import { Tag as TagIcon } from '@carbon/react/icons';
import capitalize from 'lodash-es/capitalize';
import startCase from 'lodash-es/startCase';
import { formatDateTime } from '../utils/utils';

interface EmptyBedProps {
  bedNumber?: string;
  bedType?: string;
  onAdmit?: () => void;
  isEmpty?: boolean;
}

const EmptyBedCard: React.FC<EmptyBedProps> = ({ bedNumber, onAdmit, bedType, isEmpty }) => {
  const { t } = useTranslation();

  return (
    <Layer className={`${styles.cardWithChildren} ${styles.container}`}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.tagContainer}>
            <Tag type="cool-gray">{bedNumber}</Tag>
            <TagIcon className={styles.tagIcon} />
          </div>
          <div>
            {!isEmpty && (
              <>
                <Tag type="green">{startCase(bedType)}</Tag>
                <OverflowMenu flipped>
                  <OverflowMenuItem onClick={onAdmit} itemText={t('admitBody', 'Admit')} disabled={!onAdmit} />
                </OverflowMenu>
              </>
            )}
          </div>
        </div>
        <span>
          <h4 className={styles.emptyBedText}>{t('emptyCompartment', 'Empty compartment')}</h4>
        </span>
      </Tile>
    </Layer>
  );
};

export default EmptyBedCard;
