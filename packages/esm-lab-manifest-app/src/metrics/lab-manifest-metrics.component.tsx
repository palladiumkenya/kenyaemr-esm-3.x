import { Button, Layer } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LabManifestFilters } from '../lab-manifest.resources';
import LabManifestMetricValue from './lab-manifest-metric-value.component';
import styles from './lab-manifest-metrics.scss';
import MetricCard from './lab-manifest-metric-card.component';

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
            { status: 'Draft', color: 'red' },
            { status: 'On Hold', color: 'orange' },
            { status: 'Ready to send', color: 'green' },
          ]}
        />
        <MetricCard
          title="Ready to send"
          status={[
            { status: 'Sending', color: 'red' },
            { status: 'Submitted', color: 'orange' },
          ]}
        />
        <MetricCard
          title="Manifest With Errors"
          status={[
            { status: 'Complete errors', color: 'red' },
            { status: 'Incomplete errors', color: 'orange' },
          ]}
        />
        <MetricCard
          title="Manifest With Results"
          status={[
            { status: 'Complete results', color: 'green' },
            { status: 'Incomplete results', color: 'orange' },
          ]}
        />
      </Layer>
      <Layer className={styles.btnLayer}>
        <Button
          kind="tertiary"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          iconDescription={t('addNewManifest', 'Add new Manifest')}
          onClick={handleAddLabManifest}>
          {t('addNewManifest', 'Add new Manifest')}
        </Button>
      </Layer>
    </Layer>
  );
}

export default LabManifestMetrics;
