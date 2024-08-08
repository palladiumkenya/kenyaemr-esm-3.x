import React from 'react';
import { LabManifestHeader } from '../header/lab-manifest-header.component';
import LabManifestMetrics from '../metrics/lab-manifest-metrics.component';
import { useTranslation } from 'react-i18next';
import LabManifestSummaryChart from './lab-manifest-summary-chart.component';

const LabManifestOverview = () => {
  const { t } = useTranslation();

  return (
    <div className={`omrs-main-content`}>
      <LabManifestHeader title={t('labManifestDashboard', 'Lab Manifest Dashboard')} />
      <LabManifestMetrics />
      <LabManifestSummaryChart />
    </div>
  );
};

export default LabManifestOverview;
