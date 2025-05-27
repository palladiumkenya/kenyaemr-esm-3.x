import React, { useCallback } from 'react';
import { Edit } from '@carbon/react/icons';
import { launchWorkspace, navigateAndLaunchWorkspace } from '@openmrs/esm-framework';
import { BaseOrderButton } from './base-order-button.component';
import { useMedicationOrderAction, useOrderByUuid } from '../hooks/useMedicationOrderAction';
import { launchPrescriptionEditWorkspace } from '../hooks/useModalHandler';
import { useTranslation } from 'react-i18next';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib/src';
import { Button } from '@carbon/react';

export interface MedicationOrderButtonProps {
  medicationRequestBundle?: {
    request: fhir.MedicationRequest;
    dispenses: Array<fhir.MedicationDispense>;
  };
  actionText?: string;
  closeable?: boolean;
}

interface ModifyButtonProps {
  currentVisit: boolean;
  isLoading: boolean;
  order: any;
  patientUuid: string;
}

const ModifyButton: React.FC<ModifyButtonProps> = ({ currentVisit, isLoading, order, patientUuid }) => {
  const { t } = useTranslation();

  if (currentVisit) {
    return (
      <BaseOrderButton
        size="lg"
        kind="tertiary"
        Icon={Edit}
        isLoading={isLoading}
        isDisabled={false}
        buttonText={t('modify', 'Modify')}
        onClick={() => launchPrescriptionEditWorkspace(order, patientUuid)}
      />
    );
  }

  return (
    <Button
      kind="danger--tertiary"
      size="lg"
      onClick={() =>
        navigateAndLaunchWorkspace({
          targetUrl: `\${openmrsSpaBase}/patient/${patientUuid}/chart`,
          contextKey: `patient/${patientUuid}`,
          workspaceName: 'start-visit-workspace-form',
          additionalProps: { patientUuid },
        })
      }>
      {t('activeVisitRequired', 'Start visit to modify')}
    </Button>
  );
};

export const MedicationOrderButton: React.FC<MedicationOrderButtonProps> = ({
  medicationRequestBundle,
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
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const buttonText = actionText ?? defaultButtonText;

  const launchModal = useCallback(() => {
    if (shouldShowBillModal) {
      launchWorkspace('create-bill-workspace', {
        order,
        patientUuid: order?.patient?.uuid,
        medicationRequestBundle,
      });
      return;
    }

    if (dispenseFormProps) {
      launchWorkspace('dispense-workspace', dispenseFormProps);
    }
  }, [shouldShowBillModal, medicationRequestBundle, dispenseFormProps, order]);

  if (!closeable) {
    return null;
  }

  return (
    <div>
      {shouldAllowModify && (
        <ModifyButton currentVisit={!!currentVisit} isLoading={isLoading} order={order} patientUuid={patientUuid} />
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
