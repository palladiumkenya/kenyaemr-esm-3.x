import React from 'react';
import { ModalBody, ModalFooter, Button, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { PaymentMode } from '../types';
import { deletePaymentMode, handleMutation } from './payment-mode.resource';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import styles from './delete-payment-mode.modal.scss';

type DeletePaymentModeModalProps = {
  closeModal: () => void;
  paymentMode: PaymentMode;
};

const DeletePaymentModeModal: React.FC<DeletePaymentModeModalProps> = ({ closeModal, paymentMode }) => {
  const { t } = useTranslation();

  const handleDelete = async () => {
    try {
      await deletePaymentMode(paymentMode.uuid);
      showSnackbar({
        title: t('paymentModeDeleted', 'Payment mode deleted'),
        subtitle: t('paymentModeDeletedSubtitle', 'The payment mode has been deleted'),
        kind: 'success',
        isLowContrast: true,
        timeoutInMs: 5000,
        autoClose: true,
      });
      handleMutation(`${restBaseUrl}/cashier/paymentMode?v=full`);
      closeModal();
    } catch (error) {
      showSnackbar({
        title: t('paymentModeDeletedError', 'Error deleting payment mode'),
        subtitle: t('paymentModeDeletedErrorSubtitle', 'An error occurred while deleting the payment mode'),
        kind: 'error',
        isLowContrast: true,
        timeoutInMs: 5000,
        autoClose: true,
      });
    }
  };

  return (
    <>
      <ModalHeader onClose={closeModal} className={styles.modalHeaderLabel} closeModal={closeModal}>
        {t('deletePaymentMode', 'Delete Payment Mode')}
      </ModalHeader>
      <ModalBody className={styles.modalHeaderHeading}>
        {t('deletePaymentModeDescription', 'Are you sure you want to delete this payment mode? Proceed cautiously.')}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleDelete}>
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeletePaymentModeModal;
