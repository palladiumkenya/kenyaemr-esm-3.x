import React from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { type BillDepositTransaction } from '../../types/bill-deposit.types';
import { reverseTransaction } from '../../utils/bill-deposit.utils';

type ReverseTransactionModalProps = {
  onClose: () => void;
  depositUuid: string;
  transaction: BillDepositTransaction;
};

const ReverseTransactionModal: React.FC<ReverseTransactionModalProps> = ({ onClose, depositUuid, transaction }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleReverse = async () => {
    setIsLoading(true);
    const response = await reverseTransaction(depositUuid, transaction.uuid);
    if (response.status === 204) {
      showSnackbar({
        title: t('success', 'Success'),
        kind: 'success',
        subtitle: t('transactionReversed', 'Transaction reversed successfully'),
      });
      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/deposit`), undefined, {
        revalidate: true,
      });

      onClose();
    } else {
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: t('transactionReverseError', 'Error reversing transaction'),
      });
    }
    setIsLoading(false);
  };

  return (
    <div>
      <ModalHeader onClose={onClose}>{t('reverseTransaction', 'Reverse Transaction')}</ModalHeader>
      <ModalBody>{t('reverseTransactionConfirmation', 'Are you sure you want to reverse this transaction?')}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleReverse} disabled={isLoading}>
          {t('reverse', 'Reverse')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default ReverseTransactionModal;
