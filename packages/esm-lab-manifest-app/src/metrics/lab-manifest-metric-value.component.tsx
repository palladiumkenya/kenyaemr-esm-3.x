import React from 'react';
import { useLabManifests } from '../hooks';
import { SkeletonText } from '@carbon/react';
import styles from './lab-manifest-metrics.scss';

interface LabManifestMetricValueProps {
  status: string;
}

const LabManifestMetricValue: React.FC<LabManifestMetricValueProps> = ({ status }) => {
  const { error, isLoading, manifests } = useLabManifests(status);
  if (isLoading) {
    return <SkeletonText className={styles.metricContainer} />;
  }
  if (error) {
    return;
  }
  return (
    <span>
      <strong>{status}</strong>: {manifests.length}
    </span>
  );
};

export default LabManifestMetricValue;
