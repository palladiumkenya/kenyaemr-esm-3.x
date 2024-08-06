import { Button, ButtonSet, Layer, Row, SkeletonText, Tile } from '@carbon/react';
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
      <Layer className={styles.detailHeaderContainer}>
        <Tile className={styles.detailHeaderContentLoading}>
          <Row className={styles.detailHeaderContentRow}>
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonText style={{ maxWidth: '100px' }} key={index} />
            ))}
          </Row>
          <hr />
          <Row className={styles.detailHeaderContentRow}>
            <SkeletonText style={{ maxWidth: '100px' }} />
            <SkeletonText style={{ maxWidth: '100px' }} />
          </Row>
        </Tile>
      </Layer>
    );
  }

  return (
    <Layer className={styles.detailHeaderContainer}>
      <Tile className={styles.detailHeaderContent}>
        <Row className={styles.detailHeaderContentRow}>
          <span>Start date:</span>
          <strong>{manifest.startDate ? formatDate(parseDate(manifest.startDate)) : '--'}</strong>
          <span>End date:</span>
          <strong>{manifest.endDate ? formatDate(parseDate(manifest.endDate)) : '--'}</strong>
          <span>Status:</span>
          <strong>{manifest.manifestStatus}</strong>
          <span>Dispatch date:</span>
          <strong>{manifest.dispatchDate ? formatDate(parseDate(manifest.dispatchDate)) : '--'}</strong>
        </Row>
        <hr />
        <Row className={styles.detailHeaderContentRow}>
          <span>Total Samples in the Manifest</span>
          <span className={styles.samplesCountValue}>{manifest.samples.length}</span>
        </Row>
      </Tile>
      <ButtonSet className={styles.btnSet}>
        <Button kind="tertiary" renderIcon={ArrowLeft} onClick={handleGoBack}>
          {t('back', 'Back')}
        </Button>
        <Button kind="primary" renderIcon={Edit} onClick={handleEditManifest}>
          {t('editManifest', 'Edit Manifest')}
        </Button>
      </ButtonSet>
    </Layer>
  );
};

export default LabManifestDetailHeader;
