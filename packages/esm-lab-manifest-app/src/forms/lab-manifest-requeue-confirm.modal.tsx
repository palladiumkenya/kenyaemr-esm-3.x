import { Button, ButtonSet, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { mutateManifestLinks, requeueLabManifest } from '../lab-manifest.resources';
import { MappedLabManifest } from '../types';
import styles from './lab-manifest-form.scss';

type LabManifestRequeueConfirmdialogProps = {
  labManifest: MappedLabManifest;
  onClose: () => void;
  filter: string;
};
const LabManifestRequeueConfirmdialog: React.FC<LabManifestRequeueConfirmdialogProps> = ({
  labManifest,
  onClose,
  filter,
}) => {
  const { t } = useTranslation();

  const handleResubmitManifest = async () => {
    try {
      await requeueLabManifest(labManifest);
      mutateManifestLinks(labManifest?.uuid, filter, labManifest?.manifestStatus);
      showSnackbar({
        title: t('success', 'Success'),
        kind: 'success',
        subtitle: t('requeueSuccessMessage', 'Lab manifest resubmission successful'),
      });
    } catch (error: any) {
      showSnackbar({
        title: t('error', 'Failure'),
        subtitle: t('errorMessage', 'Error resubmiting manifest {{error}}', { error: error?.message }),
        kind: 'error',
      });
    } finally {
      onClose?.();
    }
  };
  return (
    <React.Fragment>
      <ModalHeader className={styles.sectionHeader} closeModal={onClose}>
        {t('requeueLabManifest', 'Requeue Lab manifest')}
      </ModalHeader>
      <ModalBody>
        <span className={styles.modalQuiz}>
          {t(
            'requeueLabManifestConfirmQuestion',
            "Are you sure you want to requeue the lab manifest to the 'Submitted' status?",
          )}
        </span>
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={onClose} className={styles.button}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" onClick={handleResubmitManifest} className={styles.button}>
            {t('requeue', 'Requeue')}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default LabManifestRequeueConfirmdialog;
