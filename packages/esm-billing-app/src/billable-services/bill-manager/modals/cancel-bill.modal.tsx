import React from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import styles from './cancel-bill.scss';

export const CancelBillModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <React.Fragment>
      <ModalHeader onClose={onClose} className={styles.modalHeaderLabel} closeModal={onClose}>
        Cancel bill
      </ModalHeader>
      <ModalBody className={styles.modalHeaderHeading}>
        Are you sure you want to cancel this bill? Proceed cautiously.
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button kind="danger">Continue</Button>
      </ModalFooter>
    </React.Fragment>
  );
};
