import { Button, Loading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { retryClaim } from '../../dashboard/form/claims-form.resource';
import { useFacilityClaims } from './use-facility-claims';

export const RetryClaimRequest = ({ closeModal, claimId }: { closeModal: () => void; claimId: string }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { claims, mutate } = useFacilityClaims();

  const claim = claims.find((claim) => claim.id === claimId);

  const handleRetryClaim = () => {
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

  return (
    <React.Fragment>
      <ModalHeader closeModal={closeModal}>{t('retryClaim', 'Retry Claim')}</ModalHeader>
      <ModalBody>
        {t('retryClaimMessage', `Are you sure you want to retry making the request for ${claim.claimCode}?`)}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={handleRetryClaim}>
          {isSubmitting ? (
            <>
              <Loading withOverlay={false} small />
              {t('retrying', 'Retrying')}
            </>
          ) : (
            t('retry', 'Retry')
          )}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
