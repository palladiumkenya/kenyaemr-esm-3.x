import React from 'react';
import { useTranslation } from 'react-i18next';
import { LabManifestHeader } from '../header/lab-manifest-header.component';
import LabManifestMetrics from '../metrics/lab-manifest-metrics.component';
import LabManifestsTable from '../tables/lab-manifest-table.component';

const LabManifestComponent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={`omrs-main-content`}>
      <LabManifestHeader title={t('labManifestDashboard', 'Lab Manifest Dashboard')} />
      <LabManifestMetrics />
      <LabManifestsTable />
    </div>
  );
};

export default LabManifestComponent;
