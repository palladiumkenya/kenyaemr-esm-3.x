import React, { useCallback } from 'react';
import { showModal } from '@openmrs/esm-framework';
import { Order } from '@openmrs/esm-patient-common-lib';
import { BaseOrderButton } from './base-order-button.component';
import { useLabOrderAction } from '../hooks/useLabOrderAction';
import { useModalHandler } from '../hooks/useModalHandler';
import styles from '../styles/order-action.scss';

export interface LabOrderButtonProps {
  order?: Order;
  modalName?: string;
  additionalProps?: Record<string, unknown>;
  actionText?: string;
}

export const LabOrderButton: React.FC<LabOrderButtonProps> = ({
  order,
  modalName = 'pickup-lab-request-modal',
  additionalProps,
  actionText,
}) => {
  const { isLoading, isDisabled, buttonText: defaultButtonText, isInProgress } = useLabOrderAction(order);

  const { handleModalClose } = useModalHandler(additionalProps?.mutateUrl as string);
  const buttonText = actionText ?? defaultButtonText;

  const launchModal = useCallback(() => {
    const dispose = showModal(modalName, {
      closeModal: () => {
        handleModalClose();
        dispose();
      },
      order,
      ...(additionalProps && { additionalProps }),
    });
  }, [modalName, order, additionalProps, handleModalClose]);

  if (isInProgress) {
    return null;
  }

  return (
    <BaseOrderButton
      isLoading={isLoading}
      isDisabled={isDisabled}
      buttonText={buttonText}
      onClick={launchModal}
      className={styles.actionButton}
    />
  );
};
