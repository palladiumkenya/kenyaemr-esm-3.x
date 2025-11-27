import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { retryClaim, updateClaimStatus } from '../../dashboard/form/claims-form.resource';
import { useFacilityClaims } from './use-facility-claims';
import { ProgressTracker } from '../../../types';
import { updateMultipleClaimStatuses } from '../../utils';

export const ManageClaimRequest = ({
  closeModal,
  claimId,
  modalType = 'retry',
  multipleIds = [],
}: {
  closeModal: () => void;
  claimId: string;
  modalType: 'retry' | 'update' | 'all';
  multipleIds?: string[];
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { claims, mutate } = useFacilityClaims();
  const [progress, setProgress] = useState({ completed: 0, total: multipleIds.length });
  const responseUUIDs = multipleIds
    .map((claimId) => claims.find((c) => c.responseUUID === claimId)?.responseUUID)
    .filter((uuid) => uuid);

  const claim = claims.find((claim) => claim.id === claimId);

  const handleRetryClaim = () => {
    setIsSubmitting(true);
    retryClaim(claim.uuid)
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
    updateClaimStatus(claim.uuid)
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

  const handleUpdateMultipleStatus = async () => {
    setIsSubmitting(true);
    setProgress({ completed: 0, total: responseUUIDs.length });

    const updateProgressCallback = (progressData: ProgressTracker) => {
      setProgress({
        completed: progressData.completed,
        total: progressData.total,
      });
    };

    const results = await updateMultipleClaimStatuses(responseUUIDs, updateProgressCallback);

    mutate();
    if (results.failed === 0) {
      showSnackbar({
        kind: 'success',
        title: t('success', 'Success'),
        subtitle: t('allSuccessfulUpdate', 'Claim status updated successfully'),
        timeoutInMs: 3000,
      });
    } else if (results.success === 0) {
      showSnackbar({
        kind: 'error',
        title: t('error', 'Error'),
        subtitle: t('updateAllStatusesError', 'Failed to update any claim statuses'),
        timeoutInMs: 2500,
      });
    } else {
      showSnackbar({
        kind: 'warning',
        title: t('partialSuccess', 'Partial Success'),
        subtitle: t(
          'updateAllStatusesPartialSuccess',
          `Claim status updated successfully for ${results.success} claims, failed for ${results.failed} claims`,
        ),
        timeoutInMs: 3000,
      });
    }
    setIsSubmitting(false);
    closeModal();
  };

  const handleSubmit = () => {
    if (modalType === 'retry') {
      handleRetryClaim();
    } else if (modalType === 'all') {
      handleUpdateMultipleStatus();
    } else {
      handleUpdateStatus();
    }
  };

  return (
    <React.Fragment>
      <ModalHeader closeModal={closeModal}>
        {modalType === 'retry'
          ? t('retryClaim', 'Retry Claim')
          : modalType === 'all'
          ? t('updateAllStatuses', 'Update All Statuses')
          : t('updateClaimStatus', 'Update Claim Status')}
      </ModalHeader>
      <ModalBody>
        {modalType === 'retry'
          ? t('retryClaimMessage', `Are you sure you want to retry making the request for ${claim.claimCode}?`)
          : modalType === 'all'
          ? t('updateAllStatusesMessage', `You are about to update statuses for ${responseUUIDs.length} claims?`)
          : t('updateStatusMessage', `You are updating claim status for ${claim.claimCode}:`)}

        {isSubmitting && modalType === 'all' && (
          <div className="mt-4">
            <InlineLoading
              description={t('updatingProgress', `Updating ${progress.completed} of ${progress.total} claims...`)}
              status="active"
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          {isSubmitting ? (
            <>
              <InlineLoading status="active" />
              {modalType === 'retry'
                ? t('retrying', 'Retrying')
                : modalType === 'all'
                ? t('updatingProgress', `Updating ${progress.completed} of ${progress.total} claims...`)
                : t('updating', 'Updating')}
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
