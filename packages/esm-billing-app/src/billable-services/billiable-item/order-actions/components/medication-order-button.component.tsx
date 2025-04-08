import React, { useCallback } from 'react';
import { Edit } from '@carbon/react/icons';
import { showModal, launchWorkspace } from '@openmrs/esm-framework';
import { BaseOrderButton } from './base-order-button.component';
import { useMedicationOrderAction, useOrderByUuid } from '../hooks/useMedicationOrderAction';
import { launchPrescriptionEditWorkspace, useModalHandler } from '../hooks/useModalHandler';
import { useTranslation } from 'react-i18next';
export interface MedicationOrderButtonProps {
  medicationRequestBundle?: {
    request: fhir.MedicationRequest;
  };
  modalName?: string;
  additionalProps?: Record<string, unknown>;
  actionText?: string;
  closeable?: boolean;
}

export const MedicationOrderButton: React.FC<MedicationOrderButtonProps> = ({
  medicationRequestBundle,
  modalName,
  additionalProps,
  actionText,
  closeable = true,
}) => {
  const { t } = useTranslation();
  const {
    isLoading: isMedicationOrderLoading,
    isDisabled,
    buttonText: defaultButtonText,
    shouldShowBillModal,
    dispenseFormProps,
    patientUuid,
    shouldAllowModify,
  } = useMedicationOrderAction(medicationRequestBundle);
  const { data: order, isLoading: isOrderLoading } = useOrderByUuid(medicationRequestBundle?.request?.id);
  const isLoading = isMedicationOrderLoading && isOrderLoading;

  const { handleModalClose } = useModalHandler(additionalProps?.mutateUrl as string);
  const buttonText = actionText ?? defaultButtonText;
  const launchModal = useCallback(() => {
    if (shouldShowBillModal) {
      const dispose = showModal('create-bill-item-modal', {
        patientUuid,
        medicationRequestBundle,
        closeModal: () => dispose(),
      });
      return;
    }

    if (dispenseFormProps) {
      launchWorkspace('dispense-workspace', dispenseFormProps);
    }
  }, [modalName, shouldShowBillModal, handleModalClose, medicationRequestBundle, dispenseFormProps, patientUuid]);

  if (!closeable) {
    return null;
  }

  return (
    <div>
      {shouldAllowModify && (
        <BaseOrderButton
          size="lg"
          kind="tertiary"
          Icon={Edit}
          isLoading={isLoading}
          isDisabled={false}
          buttonText={t('modify', 'Modify')}
          onClick={() => launchPrescriptionEditWorkspace(order, patientUuid)}
        />
      )}
      <BaseOrderButton
        size="lg"
        isLoading={isLoading}
        isDisabled={isDisabled}
        buttonText={buttonText}
        onClick={launchModal}
      />
    </div>
  );
};
