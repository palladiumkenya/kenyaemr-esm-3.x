import React, { useCallback } from 'react';
import { launchWorkspace, showModal } from '@openmrs/esm-framework';
import { Order } from '@openmrs/esm-patient-common-lib';
import { BaseOrderButton } from './base-order-button.component';
import { useLabOrderAction } from '../hooks/useLabOrderAction';
import { useModalHandler } from '../hooks/useModalHandler';
import styles from '../styles/order-action.scss';

export interface GenericOrderButtonProps {
  order?: Order;
  modalName?: string;
  additionalProps?: Record<string, unknown>;
  actionText?: string;
}

export const GenericOrderButton: React.FC<GenericOrderButtonProps> = ({
  order,
  modalName = 'pickup-lab-request-modal',
  additionalProps,
  actionText,
}) => {
  const {
    isLoading,
    isDisabled,
    buttonText: defaultButtonText,
    isInProgress,
    shouldShowBillModal,
  } = useLabOrderAction(order);

  const { handleModalClose } = useModalHandler(additionalProps?.mutateUrl as string);
  const buttonText = defaultButtonText ?? actionText;

  const launchModal = useCallback(() => {
    if (shouldShowBillModal) {
      launchWorkspace('create-bill-workspace', {
        order,
        patientUuid: order?.patient?.uuid,
      });
    } else {
      const dispose = showModal(modalName, {
        closeModal: () => {
          handleModalClose();
          dispose();
        },
        order,
        ...(additionalProps && { additionalProps }),
      });
    }
  }, [modalName, order, additionalProps, handleModalClose, shouldShowBillModal]);

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
