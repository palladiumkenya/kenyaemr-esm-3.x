import { Button, ButtonSet, SkeletonText } from '@carbon/react';
import { ArrowLeft, Edit } from '@carbon/react/icons';
import { formatDate, launchWorkspace, navigate, parseDate } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLabManifest } from '../hooks';
import styles from './lab-manifest-header.scss';

interface LabManifestDetailHeaderProps {
  manifestUuid: string;
}

const LabManifestDetailHeader: React.FC<LabManifestDetailHeaderProps> = ({ manifestUuid }) => {
  const { isLoading, manifest } = useLabManifest(manifestUuid);
  const { t } = useTranslation();

  const handleGoBack = () => {
    navigate({ to: window.getOpenmrsSpaBase() + `home/lab-manifest` });
  };

  const handleEditManifest = () => {
    launchWorkspace('lab-manifest-form', {
      workspaceTitle: 'Lab Manifest Form',
      manifest,
    });
  };

  if (isLoading) {
    return (
      <div className={styles.manifestDetailHeader}>
        <div className={styles.manifestDetailContent}>
          {Array.from({ length: 3 }).map((_) => (
            <SkeletonText style={{ maxWidth: '400px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.manifestDetailHeader}>
        <div className={styles.manifestDetailContent}>
          <div>
            <strong>Date:</strong>
            {formatDate(parseDate(manifest.startDate))} <strong>To</strong> {formatDate(parseDate(manifest.endDate))}
          </div>
          <div>
            <strong>Status:</strong>
            {manifest.manifestStatus} | <strong>Type</strong> : {manifest.manifestType} | <strong>Courrier:</strong>
            {manifest.courierName}
          </div>
          <div>
            <strong>Dispatch Date:</strong>
            {formatDate(parseDate(manifest.dispatchDate))} | <strong>Lab person Contact:</strong>
            {manifest.labPersonContact}
          </div>
        </div>
      </div>
      <ButtonSet className={styles.btnSet}>
        <Button kind="tertiary" renderIcon={ArrowLeft} onClick={handleGoBack}>
          {t('back', 'Back')}
        </Button>
        <Button kind="tertiary" renderIcon={Edit} onClick={handleEditManifest}>
          {t('editManifest', 'Edit Manifest')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default LabManifestDetailHeader;
