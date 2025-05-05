import { Button, ButtonSet, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import LabManifestSamples from '../tables/lab-manifest-samples.component';
import { MappedLabManifest } from '../types';
import styles from './lab-manifest-form.scss';

type ManifestStatusChangeConfirmDialogProps = {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  manifest: MappedLabManifest;
};
const ManifestStatusChangeConfirmDialog: React.FC<ManifestStatusChangeConfirmDialogProps> = ({
  manifest,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ModalHeader className={styles.sectionHeader} closeModal={onClose}>
        {t('confirmChangeOfManifestStatus', 'Confirm change of manifest status')}
      </ModalHeader>
      <ModalBody>
        <span className={styles.modalQuiz}>
          {t(
            'manifestStatusChangeConfirmationQuestion',
            'Are you sure you want to change this manifest status from "Draft" to "Ready to Send"?Please review the manifest and confirm all added patients have the correct details and a physical sample before submitting for  e-logging to reference Labs. ',
          )}
        </span>
        <div className={styles.previewContainer}>
          <LabManifestSamples manifestUuid={manifest.uuid} />
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={onClose} className={styles.button}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" onClick={onConfirm} className={styles.button}>
            {t('confirm', 'Confirm')}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default ManifestStatusChangeConfirmDialog;
