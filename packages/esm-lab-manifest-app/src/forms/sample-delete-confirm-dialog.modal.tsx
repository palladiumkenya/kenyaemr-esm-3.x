import { Button, ButtonSet, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SampleDeleteConfirmDialogProps {
  onClose: () => void;
  onDelete: () => void;
}
const SampleDeleteConfirmDialog: React.FC<SampleDeleteConfirmDialogProps> = ({ onClose, onDelete }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ModalHeader closeModal={onClose}>{t('warning', 'Warning!')}</ModalHeader>
      <ModalBody>Are you sure you want to delete sample.This action is irriversible?</ModalBody>
      <ModalFooter>
        <ButtonSet>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button kind="primary" onClick={onDelete}>
            Remove
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default SampleDeleteConfirmDialog;
