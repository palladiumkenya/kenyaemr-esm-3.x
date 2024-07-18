import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './lab-manifest-metrics.scss';
import MetricsHeader from './lab-manifest-metrics-header.component';
import MetricsCard from './lab-manifest-card.component';
import { labManifest } from '../lab-manifest.mock';

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
        <MetricsCard
          label={t('completed', 'Completed')}
          value={labManifest.filter((l) => l.status === 'completed').length}
          headerLabel={t('completeManifest', 'Complete Manifest')}
        />
        <MetricsCard
          label={t('incompleted', 'Incompleted')}
          value={labManifest.filter((l) => l.status === 'completed').length}
          headerLabel={`${t('incompletedManifest', 'Incomplete Manifest')}:`}
        />
      </div>
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricsCard label={t('draft', 'Draft')} value={'0'} headerLabel={t('draftManifest', 'Draft Manifest')} />
        <MetricsCard
          label={t('onHold', 'On Hold')}
          value={labManifest.filter((l) => l.status === 'onHold').length}
          headerLabel={`${t('onHoldManifest', 'On Hold Manifest')}:`}
        />
        <MetricsCard
          label={t('readyToSend', 'Ready To send')}
          value={labManifest.filter((l) => l.status === 'readyToSend').length}
          headerLabel={t('rendyToSendManifest', 'Ready To send Manifest')}
        />
        <MetricsCard
          label={t('sending', 'Sending')}
          value={labManifest.filter((l) => l.status === 'sending').length}
          headerLabel={`${t('sendingManifest', 'Sending Manifest')}:`}
        />
        <MetricsCard
          label={t('submitted', 'Submitted')}
          value={labManifest.filter((l) => l.status === 'submitted').length}
          headerLabel={`${t('submittedManifest', 'Submitted Manifest')}:`}
        />
      </div>
    </>
  );
}

export default LabManifestMetrics;
