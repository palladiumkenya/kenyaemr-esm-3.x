import { Column, Layer, Row } from '@carbon/react';
import React from 'react';
import useLabManifestAggregates from '../hooks/useLabManifestAggregates';
import LabManifestMetricValue from './lab-manifest-metric-value.component';
import styles from './lab-manifest-metrics.scss';
import { useLabManifestMetrics } from '../hooks';

interface MetricCardProps {
  title: string;
  status?: Array<{ status: string; color?: string }>;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, status = [] }) => {
  const { isLoading, error, metrics, statusAggregates } = useLabManifestMetrics();
  const { manifests } = useLabManifestAggregates(status.map((s) => s.status));

  return (
    <Layer className={styles.metricCardContainer}>
      <p>{title}</p>
      <Row className={styles.metricCardRow}>
        <Column>
          <p className={styles.metricCardAgregateValue}>
            {
              // statusAggregates?.(status.map((s) => s.status))
              manifests.length
            }
          </p>
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
