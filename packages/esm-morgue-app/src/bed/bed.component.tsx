import React from 'react';
import { Layer, Tag, Tile } from '@carbon/react';
import styles from './bed.scss';
import { useTranslation } from 'react-i18next';
import { Tag as TagIcon } from '@carbon/react/icons';

interface BedProps {
  label: string;
  value: number | string;
  headerLabel: string;
  children?: React.ReactNode;
}

const BedCard: React.FC<BedProps> = ({ children, headerLabel, label, value }) => {
  const { t } = useTranslation();
  return (
    <Layer className={`${children && styles.cardWithChildren} ${styles.container}`}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <TagIcon /> <Tag type="cool-gray">BMW-123</Tag>
        </div>
      </Tile>
    </Layer>
  );
};

export default BedCard;
