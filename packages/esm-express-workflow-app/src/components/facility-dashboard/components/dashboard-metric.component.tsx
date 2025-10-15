import React from 'react';
import styles from './dashboard-metric.scss';
import { Tile, Grid, Column } from '@carbon/react';

interface DashboardMetricProps {
  title: string;
  value: string | number;
}

export function DashboardMetric({ title, value }: DashboardMetricProps) {
  return (
    <Tile className={styles.metricTile}>
      <h4 className={styles.metricTitle}>{title}</h4>
      <p className={styles.metricValue}>{value}</p>
    </Tile>
  );
}
