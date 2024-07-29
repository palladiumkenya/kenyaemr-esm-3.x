import React from 'react';
import { useTranslation } from 'react-i18next';
import { LabManifestFilters } from '../lab-manifest.resources';
import MetricsHeader from './lab-manifest-metrics-header.component';
import styles from './lab-manifest-metrics.scss';
import LabManifestMetricValue from './lab-manifest-metric-value.component';

export interface Service {
  uuid: string;
  display: string;
}

function LabManifestMetrics() {
  const { t } = useTranslation();
  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        {LabManifestFilters.map((f, index) => (
          <LabManifestMetricValue status={f.value} />
        ))}
      </div>
    </>
  );
}

export default LabManifestMetrics;
