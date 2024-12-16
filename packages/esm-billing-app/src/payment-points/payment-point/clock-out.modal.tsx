import { Button, Loading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clockOut, useActiveSheet } from '../payment-points.resource';
import { useClockInStatus } from '../use-clock-in-status';

export const ClockOut = ({ closeModal }: { closeModal: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate } = useActiveSheet();
  const { t } = useTranslation();

  const { globalActiveSheet, isLoading, error } = useClockInStatus();

  const onContinue = () => {
    setIsSubmitting(true);
    clockOut(globalActiveSheet.uuid, {
      clockOut: new Date().toISOString(),
    })
      .then(() => {
        showSnackbar({
          title: t('success', 'Success'),
          subtitle: t('successfullyClockedOut', 'Successfully Clocked Out'),
          kind: 'success',
        });
        mutate();
      })
      .catch(() => {
        showSnackbar({
          title: t('anErrorOccurred', 'An Error Occurred'),
          subtitle: t('anErrorOccurredClockingOut', 'An error occurred clocking out'),
          kind: 'error',
        });
      })
      .finally(() => {
        setIsSubmitting(false);
        closeModal();
      });
  };

  return (
    <React.Fragment>
      <ModalHeader closeModal={closeModal}>Clock Out</ModalHeader>
      <ModalBody>
        You will be clocked out of {globalActiveSheet.cashPoint.name} right now. Do you want to proceed.
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={onContinue} kind="danger" disabled={isLoading || error}>
          {isSubmitting ? (
            <>
              <Loading withOverlay={false} small />
              {t('clockingOut', 'Clocking Out')}
            </>
          ) : (
            t('clockOut', 'Clock Out')
          )}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
