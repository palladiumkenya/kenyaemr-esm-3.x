import { Tile } from '@carbon/react';
import React from 'react';
import styles from './metrics.scss';

type MetricsCardProps = {
  title: string;
  header: string;
  value: number;
};
const MetricsCard: React.FC<MetricsCardProps> = ({ title, header, value }) => {
  return (
    <Tile className={styles.metricCard}>
      <strong id="title">{title}</strong>
      <p>{header}</p>
      <span>{value}</span>
    </Tile>
  );
};

export default MetricsCard;
