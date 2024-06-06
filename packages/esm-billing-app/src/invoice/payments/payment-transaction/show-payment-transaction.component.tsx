import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalBody, ModalHeader } from '@carbon/react';
import styles from './show-payment-transaction.scss';

export interface ShowPaymentTransactionProps {
  closeModal: () => void;
  statement: string;
}

const ShowPaymentTransaction: React.FC<ShowPaymentTransactionProps> = ({ closeModal, statement }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.center}>
      <ModalHeader closeModal={closeModal} />
      <ModalBody>
        <section className={styles.section}>
          <p>{statement}</p>
        </section>
      </ModalBody>
    </div>
  );
};

export default ShowPaymentTransaction;
