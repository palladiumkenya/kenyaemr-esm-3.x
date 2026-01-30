import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';

interface OperationConfirmationModalProps {
  close: () => void;
  onConfirm: () => void;
  modalHeading?: string;
  modalBody?: string;
  operationName?: string;
  operationType?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  danger?: boolean;
  patientName?: string;
}

const OperationConfirmation: React.FC<OperationConfirmationModalProps> = ({
  close,
  onConfirm,
  modalHeading,
  modalBody,
  operationName,
  operationType,
  primaryButtonText,
  secondaryButtonText,
  danger = false,
  patientName,
}) => {
  const { t } = useTranslation();

  const heading = modalHeading || t('confirmation', 'Confirmation');
  const defaultMessage = patientName
    ? t('operationConfirmationWithPatient', 'Do you want to {{operationType}} for {{patientName}}?', {
        operationType: operationType || operationName,
        patientName,
      })
    : t('operationConfirmationMessages', 'Do you want to {{operationTypeOrName}}?', {
        operationTypeOrName: operationType || operationName,
      });

  const message = modalBody || defaultMessage;

  const primaryText = primaryButtonText || t('yesConfirm', 'Yes, Confirm');
  const secondaryText = secondaryButtonText || t('cancel', 'Cancel');

  return (
    <>
      <ModalHeader title={heading} closeModal={close}></ModalHeader>
      <ModalBody>
        <p>{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close}>
          {secondaryText}
        </Button>
        <Button kind={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {primaryText}
        </Button>
      </ModalFooter>
    </>
  );
};

export default OperationConfirmation;
