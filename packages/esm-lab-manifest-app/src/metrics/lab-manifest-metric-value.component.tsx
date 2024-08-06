import { SkeletonText } from '@carbon/react';
import React from 'react';
import { useLabManifests } from '../hooks';
import styles from './lab-manifest-metrics.scss';
import { LabManifestFilters } from '../lab-manifest.resources';

interface LabManifestMetricValueProps {
  status: string;
  color?: string;
}

const LabManifestMetricValue: React.FC<LabManifestMetricValueProps> = ({ status, color }) => {
  const { error, isLoading, manifests } = useLabManifests(LabManifestFilters.find((lb) => lb.value === status)?.params);
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
      {manifests?.length ?? '--'}
    </span>
  );
};

export default LabManifestMetricValue;
