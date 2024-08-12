import { SkeletonText } from '@carbon/react';
import React from 'react';
import { useLabManifestMetrics } from '../hooks';
import styles from './lab-manifest-metrics.scss';

interface LabManifestMetricValueProps {
  status: string;
  color?: string;
}

const LabManifestMetricValue: React.FC<LabManifestMetricValueProps> = ({ status, color }) => {
  const { error, isLoading, metrics } = useLabManifestMetrics();
  if (isLoading) {
    return <SkeletonText className={styles.labManifestStatusMetricValue} />;
  }
  if (error) {
    return;
  }
  return (
    <span>
      <span className={styles[color]}>{status}</span> <br />
      <br />
      {metrics?.[status]}
    </span>
  );
};

export default LabManifestMetricValue;
