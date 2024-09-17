import React from 'react';
import styles from './providers-header.scss';

interface MetricCardProps {
  label: string;
  value: string | number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => {
  return (
    <div className={styles.warp__metrics}>
      <span className={styles.metric__label}>{label}</span>
      <span className={styles.metric__value}>{value}</span>
    </div>
  );
};
