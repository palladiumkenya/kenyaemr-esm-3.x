import { Button, Loading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { retryClaim, updateClaimStatus } from '../../dashboard/form/claims-form.resource';
import { useFacilityClaims } from './use-facility-claims';

export const ManageClaimRequest = ({
  closeModal,
  claimId,
  modalType = 'retry',
}: {
  closeModal: () => void;
  claimId: string;
  modalType: 'retry' | 'update';
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { claims, mutate } = useFacilityClaims();

  const claim = claims.find((claim) => claim.id === claimId);

  const handleRetryClaim = () => {
    retryClaim(claim.externalId)
      .then(() => {
        mutate();
        showSnackbar({
          kind: 'success',
          title: t('success', 'Success'),
          subtitle: t('succcessfullRetry', 'Claim sent successfully'),
          timeoutInMs: 3000,
        });
      })
      .catch(() => {
        showSnackbar({
          kind: 'error',
          title: t('error', 'Error'),
          subtitle: t('retryClaimError', 'Request Failed, Please try later'),
          timeoutInMs: 2500,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
        closeModal();
      });
  };

  const handleUpdateStatus = () => {
    setIsSubmitting(true);
    updateClaimStatus(claim.externalId)
      .then(() => {
        mutate();
        showSnackbar({
          kind: 'success',
          title: t('success', 'Success'),
          subtitle: t('successfulUpdate', 'Claim status updated successfully'),
          timeoutInMs: 3000,
        });
      })
      .catch(() => {
        showSnackbar({
          kind: 'error',
          title: t('error', 'Error'),
          subtitle: t('updateStatusError', 'Status update failed, Please try later'),
          timeoutInMs: 2500,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
        closeModal();
      });
  };

  const handleSubmit = () => {
    if (modalType === 'retry') {
      handleRetryClaim();
    } else {
      handleUpdateStatus();
    }
  };

  return (
    <React.Fragment>
      <ModalHeader closeModal={closeModal}>
        {modalType === 'retry' ? t('retryClaim', 'Retry Claim') : t('updateClaimStatus', 'Update Claim Status')}
      </ModalHeader>
      <ModalBody>
        {modalType === 'retry'
          ? t('retryClaimMessage', `Are you sure you want to retry making the request for ${claim.claimCode}?`)
          : t('updateStatusMessage', `You are updating claim status for ${claim.claimCode}:`)}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          {isSubmitting ? (
            <>
              <Loading withOverlay={false} small />
              {modalType === 'retry' ? t('retrying', 'Retrying') : t('updating', 'Updating')}
            </>
          ) : modalType === 'retry' ? (
            t('retry', 'Retry')
          ) : (
            t('update', 'Update')
          )}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
