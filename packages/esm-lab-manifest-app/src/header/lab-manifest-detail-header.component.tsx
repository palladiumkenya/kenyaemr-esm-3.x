import { Button } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLabManifest } from '../hooks';
import MetricsCard from '../metrics/lab-manifest-card.component';
import styles from './lab-manifest-header.scss';
import LabManifestIllustration from './lab-manifest-illustration.component';

interface LabManifestDetailHeaderProps {
  manifestUuid: string;
}

const LabManifestDetailHeader: React.FC<LabManifestDetailHeaderProps> = ({ manifestUuid }) => {
  const { isLoading, manifest } = useLabManifest(manifestUuid);
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.manifestDetailHeader}>
        <LabManifestIllustration />
        <div className={styles.manifestDetailContent}>
          <div>
            <strong>Date:</strong>
            {manifest.startDate} <strong>To</strong> {manifest.endDate}
          </div>
          <div>
            <strong>Status:</strong>
            {manifest.status} | <strong>Type</strong> : {manifest.type} | <strong>Courrier:</strong>
            {manifest.courrier}
          </div>
          <div>
            <strong>Dispatch Date:</strong>
            {manifest.dispatch} | <strong>Lab person Contact:</strong>
            {manifest.labPersonContact}
          </div>
        </div>
        <div>
          <Button>{t('editManifest', 'Edit Manifest')}</Button>
        </div>
      </div>
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricsCard
          label={t('samples', 'Samples')}
          value={'0'}
          headerLabel={t('manifestSamples', 'Manifest samples')}
        />
        <MetricsCard
          label={t('request', 'Requests')}
          value={'0'}
          headerLabel={t('activeRequests', 'Active Requests')}
        />
      </div>
    </div>
  );
};

export default LabManifestDetailHeader;
