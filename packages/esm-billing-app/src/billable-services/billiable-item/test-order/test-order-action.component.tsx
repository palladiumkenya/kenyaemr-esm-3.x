import { InlineLoading, Button } from '@carbon/react';
import { Order } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTestOrderBillStatus } from './test-order-action.resource';
import { launchWorkspace, showModal } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import styles from './test-order-action.scss';
import { createMedicationDispenseProps } from './dispense.resource';

type TestOrderProps = {
  order?: Order;
  modalName?: string;
  additionalProps?: Record<string, unknown>;
  actionText?: string;
  medicationRequestBundle?: {
    request: fhir.MedicationRequest;
  };
  handleOpenDispenseForm?: () => void;
  closeable?: boolean;
};

enum FulfillerStatus {
  IN_PROGRESS = 'IN_PROGRESS',
}

const TestOrderAction: React.FC<TestOrderProps> = (props) => {
  const { order, modalName, additionalProps, actionText, medicationRequestBundle } = props;
  const { t } = useTranslation();

  const isDispenseOrder = Object.hasOwn(props, 'medicationRequestBundle');
  const dispenseFormProps = isDispenseOrder ? createMedicationDispenseProps(props) : null;
  const orderUuid = order?.uuid ?? medicationRequestBundle?.request?.id;
  const patientUuid = order?.patient?.uuid ?? medicationRequestBundle?.request?.subject?.reference?.split('/')[1];

  const { isLoading, hasPendingPayment } = useTestOrderBillStatus(orderUuid, patientUuid);

  // Handle modal close and revalidation
  const handleModalClose = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith(additionalProps?.mutateUrl as string), undefined, {
      revalidate: true,
    });
  }, [additionalProps?.mutateUrl]);

  const launchModal = useCallback(() => {
    if (isDispenseOrder) {
      launchWorkspace('dispense-workspace', dispenseFormProps);
      return;
    }

    const dispose = showModal(modalName ?? 'pickup-lab-request-modal', {
      closeModal: () => {
        handleModalClose();
        dispose();
      },
      order,
      ...(additionalProps && { additionalProps }),
    });
  }, [isDispenseOrder, modalName, order, additionalProps, dispenseFormProps, handleModalClose]);

  if (isLoading) {
    return (
      <Button kind="ghost" size="md" disabled>
        <InlineLoading description={t('verifyingBillStatus', 'Verifying bill status...')} status="active" />
      </Button>
    );
  }

  if (order?.fulfillerStatus === FulfillerStatus.IN_PROGRESS || (isDispenseOrder && !props?.closeable)) {
    return null;
  }

  const buttonText = hasPendingPayment
    ? t('unsettledBill', 'Unsettled bill')
    : isDispenseOrder
    ? actionText ?? t('dispense', 'Dispense')
    : actionText ?? t('pickLabRequest', 'Pick Lab Request');

  return (
    <Button
      kind="primary"
      className={!isDispenseOrder ? styles.actionButton : ''}
      size={!isDispenseOrder ? 'md' : ''}
      disabled={hasPendingPayment}
      onClick={launchModal}>
      {buttonText}
    </Button>
  );
};

export default TestOrderAction;
