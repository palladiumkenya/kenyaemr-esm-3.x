import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showNotification, showSnackbar } from '@openmrs/esm-framework';
import { deleteEncounter } from './regimen.resource';
import { mutate } from 'swr';

interface DeleteRegimenModalProps {
  closeCancelModal: () => void;
  regimenEncounterUuid: string;
  patientUuid: string;
  category: string;
  closeWorkspace: () => void;
}

const DeleteRegimenModal: React.FC<DeleteRegimenModalProps> = ({
  closeCancelModal,
  regimenEncounterUuid,
  patientUuid,
  category,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = useCallback(
    (event) => {
      event.preventDefault();
      setIsSubmitting(true);

      deleteEncounter(regimenEncounterUuid)
        .then((response) => {
          if (response.status === 204) {
            closeCancelModal();
            showSnackbar({
              title: t('regimenDeleted', 'Regimen deleted'),
              subtitle: t('regimenDeletedSuccessfully', 'Regimen deleted successfully'),
              kind: 'success',
              timeoutInMs: 3500,
              isLowContrast: true,
            });
            mutate(`/ws/rest/v1/kenyaemr/regimenHistory?patientUuid=${patientUuid}&category=${category}`);
            mutate(`/ws/rest/v1/kenyaemr/currentProgramDetails?patientUuid=${patientUuid}`);
            mutate(`/ws/rest/v1/kenyaemr/patientSummary?patientUuid=${patientUuid}`);
            mutate(`/ws/rest/v1/kenyaemr/lastRegimenEncounter?patientUuid=${patientUuid}&category=${category}`);
            closeWorkspace?.();
          }
        })
        .catch((err) => {
          showNotification({
            title: t('regimenDeletedError', 'Error deleting regimen'),
            kind: 'error',
            critical: true,
            description: err?.message,
          });
        });
    },
    [t, regimenEncounterUuid, closeCancelModal, category, patientUuid, closeWorkspace],
  );

  return (
    <div>
      <ModalHeader closeModal={closeCancelModal} title={t('deleteRegimen', 'Delete Regimen')} />
      <ModalBody>
        <p>{t('deleteRegimenModalConfirmationText', 'Are you sure you want to delete regimen?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeCancelModal}>
          {t('discard', 'Discard')}
        </Button>
        <Button kind="danger" onClick={handleCancel} disabled={isSubmitting}>
          {t('deleteRegimen', 'Delete Regimen')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteRegimenModal;
