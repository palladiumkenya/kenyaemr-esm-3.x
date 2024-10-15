import { Button, ButtonSet, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './relationship-modal.scss';

type DeleteRelationshipConfirmDialogProps = {
  onClose: () => void;
  onDelete: () => void;
};

const DeleteRelationshipConfirmDialog: React.FC<DeleteRelationshipConfirmDialogProps> = ({ onClose, onDelete }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ModalHeader closeModal={onClose} className={styles.heading}>
        {t('deleteRelationship', 'Delete Relationship')}
      </ModalHeader>{' '}
      <ModalBody>{t('confirmationQuestion', 'Are you sure you want to delete relationship?')}</ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button className={styles.button} kind="danger" onClick={onDelete}>
            Delete
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default DeleteRelationshipConfirmDialog;
