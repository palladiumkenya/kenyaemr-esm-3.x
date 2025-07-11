import React from 'react';
import { Layer, Tile } from '@carbon/react';
import styles from './metrics-card.scss';

interface MetricsCardProps {
  label: string;
  value: number | string | React.ReactNode;
  headerLabel: string;
  children?: React.ReactNode;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ children, headerLabel, label, value }) => {
  return (
    <Layer className={`${children && styles.cardWithChildren} ${styles.container}`}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
          </div>
          {children}
        </div>
        <div>
          <label className={styles.totalsLabel}>{label}</label>
          <p className={styles.totalsValue}>{value}</p>
        </div>
      </Tile>
    </Layer>
  );
};

export default MetricsCard;
