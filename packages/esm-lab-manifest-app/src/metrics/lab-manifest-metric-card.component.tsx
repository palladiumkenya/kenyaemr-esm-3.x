import { Column, Layer, Row, SkeletonPlaceholder } from '@carbon/react';
import React from 'react';
import { useLabManifestMetrics } from '../hooks';
import LabManifestMetricValue from './lab-manifest-metric-value.component';
import styles from './lab-manifest-metrics.scss';

interface MetricCardProps {
  title: string;
  status?: Array<{ status: string; color?: string }>;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, status = [] }) => {
  const { isLoading, error, metrics, statusAggregates } = useLabManifestMetrics();

  if (isLoading) {
    return <SkeletonPlaceholder style={{ flex: 1 }} />;
  }

  if (error) {
    return null;
  }

  return (
    <Layer className={styles.metricCardContainer}>
      <p>{title}</p>
      <Row className={styles.metricCardRow}>
        <Column>
          <p className={styles.metricCardAgregateValue}>{statusAggregates?.(status.map((s) => s.status))}</p>
        </Column>
        <Column>
          <Row className={styles.metricCardStatusRow}>
            {status.map(({ status, color }, index) => (
              <LabManifestMetricValue status={status} color={color} key={index} />
            ))}
          </Row>
        </Column>
      </Row>
    </Layer>
  );
};

export default MetricCard;
