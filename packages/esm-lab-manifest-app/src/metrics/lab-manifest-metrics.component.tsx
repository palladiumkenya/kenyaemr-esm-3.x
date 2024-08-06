import { Button, Layer } from '@carbon/react';
import { Add, ArrowRight } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MetricCard from './lab-manifest-metric-card.component';
import styles from './lab-manifest-metrics.scss';

export interface Service {
  uuid: string;
  display: string;
}

function LabManifestMetrics() {
  const { t } = useTranslation();

  const handleAddLabManifest = () => {
    launchWorkspace('lab-manifest-form', {
      workspaceTitle: 'Lab Manifest Form',
    });
  };

  return (
    <Layer className={styles.metricContainer}>
      <Layer className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricCard
          title="TotalManifest"
          status={[
            { status: 'Draft', color: 'metricDanger' },
            { status: 'On Hold', color: 'metricWarning' },
            { status: 'Ready to send', color: 'metricSuccess' },
          ]}
        />
        <MetricCard
          title="Ready to send"
          status={[
            { status: 'Sending', color: 'metricDanger' },
            { status: 'Submitted', color: 'metricWarning' },
          ]}
        />
        <MetricCard
          title="Complete Manifest"
          status={[
            { status: 'Complete results', color: 'metricSuccess' },
            { status: 'Complete errors', color: 'metricDanger' },
          ]}
        />
        <MetricCard
          title="Incomplete Manifest"
          status={[
            { status: 'Incomplete results', color: 'metricWarning' },
            { status: 'Incomplete errors', color: 'metricDanger' },
          ]}
        />
      </Layer>
      <Layer className={styles.btnLayer}>
        <Button
          kind="ghost"
          renderIcon={Add}
          iconDescription={t('addNewManifest', 'Add new Manifest')}
          onClick={handleAddLabManifest}>
          {t('addNewManifest', 'Add new Manifest')}
        </Button>
      </Layer>
    </Layer>
  );
}

export default LabManifestMetrics;
