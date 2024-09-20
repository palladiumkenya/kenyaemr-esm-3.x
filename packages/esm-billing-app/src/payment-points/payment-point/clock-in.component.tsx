import { Button, Loading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar, useSession } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentPoint } from '../../types';
import { clockIn, useTimeSheets } from '../payment-points.resource';

export const ClockIn = ({ closeModal, paymentPoint }: { closeModal: () => void; paymentPoint: PaymentPoint }) => {
  const { mutate } = useTimeSheets();
  const { user } = useSession();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onContinue = () => {
    setIsSubmitting(true);
    clockIn({ cashier: user.uuid, cashPoint: paymentPoint.uuid, clockIn: new Date().toISOString() })
      .then(() => {
        showSnackbar({
          title: t('success', 'Success'),
          subtitle: t('successfullyClockedIn', 'Successfully Clocked In'),
          kind: 'success',
        });
        mutate();
      })
      .catch(() => {
        showSnackbar({
          title: t('anErrorOccurred', 'An Error Occurred'),
          subtitle: t('anErrorOccurredClockingIn', 'An error occurred clocking in'),
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
      <ModalHeader closeModal={closeModal}>Clock In</ModalHeader>
      <ModalBody>You will be clocked in on {paymentPoint.name} right now. Do you want to proceed.</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={onContinue}>
          {isSubmitting ? (
            <>
              <Loading withOverlay={false} small />
              {t('clockingIn', 'Clocking in')}
            </>
          ) : (
            t('clockIn', 'Clock In')
          )}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
