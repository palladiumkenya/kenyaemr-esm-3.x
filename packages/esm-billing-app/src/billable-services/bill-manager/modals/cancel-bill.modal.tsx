import React from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import styles from './cancel-bill.scss';
import { useTranslation } from 'react-i18next';

export const CancelBillModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ModalHeader onClose={onClose} className={styles.modalHeaderLabel} closeModal={onClose}>
        {t('cancelBill', 'Cancel Bill')}
      </ModalHeader>
      <ModalBody className={styles.modalHeaderHeading}>
        {t('cancelBillDescription', 'Are you sure you want to cancel this bill? Proceed cautiously.')}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger">{t('continue', 'Continue')}</Button>
      </ModalFooter>
    </React.Fragment>
  );
};
