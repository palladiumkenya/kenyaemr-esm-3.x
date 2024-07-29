import React from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import cancelBillStyles from './cancel-bill.scss';

export const DeleteBillModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <React.Fragment>
      <ModalHeader onClose={onClose} className={cancelBillStyles.modalHeaderLabel} closeModal={onClose}>
        Delete bill
      </ModalHeader>
      <ModalBody className={cancelBillStyles.modalHeaderHeading}>
        Are you sure you want to delete this bill? Proceed cautiously.
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
