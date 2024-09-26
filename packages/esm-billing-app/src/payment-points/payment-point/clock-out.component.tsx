import { Button, Loading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar, useSession } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentPoint } from '../../types';
import { clockOut, useProviders, useTimeSheets, useUsers } from '../payment-points.resource';

export const ClockOut = ({ closeModal, paymentPoint }: { closeModal: () => void; paymentPoint: PaymentPoint }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate } = useTimeSheets();
  const { t } = useTranslation();
  const { providers } = useProviders();
  const { user } = useSession();
  const { users } = useUsers();

  const userPerson = users.find((u) => u.uuid === user.uuid)?.person;
  const providerUUID = providers.find((p) => p.person.uuid === userPerson?.uuid)?.uuid;

  const onContinue = () => {
    setIsSubmitting(true);
    clockOut({ clockOut: new Date().toISOString(), cashier: providerUUID, cashPoint: paymentPoint.uuid })
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
      <ModalBody>You will be clocked out of {paymentPoint.name} right now. Do you want to proceed.</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={onContinue} kind="danger">
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
