import { Button, Layer } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LabManifestHeader } from '../header/lab-manifest-header.component';
import LabManifestMetrics from '../metrics/lab-manifest-metrics.component';
import LabManifestsTable from '../tables/lab-manifest-table.component';
import styles from '../metrics/lab-manifest-metrics.scss';

const LabManifestComponent: React.FC = () => {
  const { t } = useTranslation();

  const handleAddLabManifest = () => {
    launchWorkspace('lab-manifest-form', {
      workspaceTitle: 'Lab Manifest Form',
    });
  };
  return (
    <div className={`omrs-main-content`}>
      <LabManifestHeader title={t('labManifestDashboard', 'Lab Manifest Dashboard')} />
      <Layer className={styles.btnLayer}>
        <Button
          kind="ghost"
          renderIcon={Add}
          iconDescription={t('addNewManifest', 'Add new Manifest')}
          onClick={handleAddLabManifest}>
          {t('addNewManifest', 'Add new Manifest')}
        </Button>
      </Layer>
      <LabManifestsTable />
    </div>
  );
};

export default LabManifestComponent;
