import { Button, Layer, Row, SkeletonText, Tile } from '@carbon/react';
import { ArrowLeft, Edit, Printer, Queued } from '@carbon/react/icons';
import { formatDate, launchWorkspace, navigate, parseDate, showModal, showSnackbar } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLabManifest } from '../hooks';
import {
  editableManifestStatus,
  printableManifestStatus,
  printManifest,
  resubmittableManifestStatus,
} from '../lab-manifest.resources';
import styles from './lab-manifest-header.scss';

interface LabManifestDetailHeaderProps {
  manifestUuid: string;
}

const LabManifestDetailHeader: React.FC<LabManifestDetailHeaderProps> = ({ manifestUuid }) => {
  const { isLoading, manifest, mutate } = useLabManifest(manifestUuid);
  const { t } = useTranslation();

  const handleGoBack = () => {
    navigate({ to: window.getOpenmrsSpaBase() + `lab-manifest` });
  };

  const handleEditManifest = () => {
    launchWorkspace('lab-manifest-form', {
      workspaceTitle: 'Lab Manifest Form',
      manifest,
    });
  };

  const handlePrintManifest = async (log: boolean = false) => {
    try {
      await printManifest(manifest.uuid, log);
    } catch (error) {
      showSnackbar({ title: 'Failure', subtitle: 'Error printing manifest', kind: 'error' });
    }
  };

  const handleLaunchRequeueConfirmModal = () => {
    const dispose = showModal('lab-manifest-requeue-confirn-modal', {
      labManifest: manifest,
      onClose: () => {
        dispose();
        mutate();
      },
      filter: manifest.manifestStatus,
    });
  };

  if (isLoading) {
    return (
      <Layer className={styles.detailHeaderContainer}>
        <Tile className={styles.detailHeaderContentLoading}>
          <Row className={styles.detailHeaderContentRow}>
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonText key={index} />
            ))}
          </Row>
          <hr />
          <Row className={styles.detailHeaderContentRow}>
            <SkeletonText />
            <SkeletonText />
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
      <Row className={styles.btnSet}>
        <Button kind="tertiary" renderIcon={ArrowLeft} onClick={handleGoBack}>
          {t('back', 'Back')}
        </Button>
        <Row className={styles.btnSetRight}>
          {editableManifestStatus.includes(manifest.manifestStatus) && (
            <Button kind="primary" renderIcon={Edit} onClick={handleEditManifest} size="md">
              {t('editManifest', 'Edit Manifest')}
            </Button>
          )}
          {resubmittableManifestStatus.includes(manifest.manifestStatus) && (
            <Button kind="tertiary" renderIcon={Queued} onClick={handleLaunchRequeueConfirmModal} size="md">
              {t('requeueManifest', 'Requeue Manifest')}
            </Button>
          )}
          {printableManifestStatus.includes(manifest.manifestStatus) && (
            <>
              <Button
                kind="tertiary"
                renderIcon={Printer}
                onClick={async () => await handlePrintManifest(false)}
                size="md">
                {t('printManifest', 'Print Manifest')}
              </Button>
              <Button
                kind="tertiary"
                renderIcon={Printer}
                onClick={async () => await handlePrintManifest(true)}
                size="md">
                {t('printManifestLog', 'Print Manifest log')}
              </Button>
            </>
          )}
        </Row>
      </Row>
    </Layer>
  );
};

export default LabManifestDetailHeader;
