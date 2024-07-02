import React from 'react';
import classNames from 'classnames';
import { Layer, Tile } from '@carbon/react';
import styles from './metrics-card.scss';

interface MetricsCardProps {
  label: string;
  value: number | string;
  headerLabel: string;
  children?: React.ReactNode;
  service?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, headerLabel, children }) => {
  return (
    <Layer
      className={classNames(styles.container, {
        [styles.cardWithChildren]: children,
      })}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
            {children}
          </div>
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
