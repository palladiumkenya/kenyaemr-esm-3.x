import React from 'react';
import { useTranslation } from 'react-i18next';
import { labManifest } from '../lab-manifest.mock';
import { LabManifestFilters } from '../lab-manifest.resources';
import MetricsHeader from './lab-manifest-metrics-header.component';
import styles from './lab-manifest-metrics.scss';

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
          <span key={index}>
            <strong>{f.label}</strong>: {labManifest.filter((l) => l.status === f.value).length}
          </span>
        ))}
      </div>
    </>
  );
}

export default LabManifestMetrics;
