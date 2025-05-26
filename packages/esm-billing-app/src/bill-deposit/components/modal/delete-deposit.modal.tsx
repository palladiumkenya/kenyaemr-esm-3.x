import React from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { deleteDeposit } from '../../utils/bill-deposit.utils';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';

type DeleteDepositModalProps = {
  isOpen: boolean;
  onClose: () => void;
  depositUuid: string;
};

const DeleteDepositModal: React.FC<DeleteDepositModalProps> = ({ isOpen, onClose, depositUuid }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const response = await deleteDeposit(depositUuid);
    if (response.status === 204) {
      showSnackbar({
        title: t('success', 'Success'),
        kind: 'success',
        subtitle: t('depositDeleted', 'Deposit deleted successfully'),
      });
      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/deposit`), undefined, {
        revalidate: true,
      });

      onClose();
    } else {
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: t('depositDeleteError', 'Error deleting deposit'),
      });
    }
    setIsLoading(false);
  };

  return (
    <div>
      <ModalHeader onClose={onClose}>{t('deleteDeposit', 'Delete Deposit')}</ModalHeader>
      <ModalBody>{t('deleteDepositConfirmation', 'Are you sure you want to delete this deposit?')}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleDelete} disabled={isLoading}>
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteDepositModal;
