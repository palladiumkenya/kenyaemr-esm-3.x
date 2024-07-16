import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './lab-manifest-metrics.scss';
import MetricsHeader from './lab-manifest-metrics-header.component';
import MetricsCard from './lab-manifest-card.component';

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
          value={'0'}
          headerLabel={t('completeManifest', 'Complete Manifest')}
        />
        <MetricsCard
          label={t('incompleted', 'Incompleted')}
          value={'0'}
          headerLabel={`${t('incompletedManifest', 'Incomplete Manifest')}:`}
        />
      </div>
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricsCard label={t('draft', 'Draft')} value={'0'} headerLabel={t('draftManifest', 'Draft Manifest')} />
        <MetricsCard
          label={t('onHold', 'On Hold')}
          value={'0'}
          headerLabel={`${t('onHoldManifest', 'On Hold Manifest')}:`}
        />
        <MetricsCard
          label={t('readyToSend', 'Ready To send')}
          value={'0'}
          headerLabel={t('rendyToSendManifest', 'Ready To send Manifest')}
        />
        <MetricsCard
          label={t('sending', 'Sending')}
          value={'0'}
          headerLabel={`${t('sendingManifest', 'Sending Manifest')}:`}
        />
        <MetricsCard
          label={t('submitted', 'Submitted')}
          value={'0'}
          headerLabel={`${t('submittedManifest', 'Submitted Manifest')}:`}
        />
      </div>
    </>
  );
}

export default LabManifestMetrics;
