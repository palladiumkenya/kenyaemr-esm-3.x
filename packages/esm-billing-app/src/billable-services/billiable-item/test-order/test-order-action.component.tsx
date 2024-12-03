import { InlineLoading, Button } from '@carbon/react';
import { Order } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTestOrderBillStatus } from './test-order-action.resource';
import { showModal } from '@openmrs/esm-framework';
import { mutate } from 'swr';

type TestOrderProps = {
  order: Order;
  modalName?: string;
  additionalProps?: Record<string, unknown>;
  actionText?: string;
  medicationRequestBundle?: {
    request: fhir.MedicationRequest;
  };
  handleOpenDispenseForm?: () => void;
};

enum FulfillerStatus {
  IN_PROGRESS = 'IN_PROGRESS',
}

// Memoize the comparison function
const areEqual = (prevProps: TestOrderProps, nextProps: TestOrderProps) => {
  if (prevProps?.order?.uuid !== nextProps?.order?.uuid) {
    return false;
  }
  if (prevProps?.modalName !== nextProps?.modalName) {
    return false;
  }
  if (prevProps?.actionText !== nextProps?.actionText) {
    return false;
  }
  if (prevProps?.medicationRequestBundle?.request?.id !== nextProps?.medicationRequestBundle?.request?.id) {
    return false;
  }

  // Only stringify additionalProps if everything else matches
  return JSON.stringify(prevProps?.additionalProps) === JSON.stringify(nextProps?.additionalProps);
};

// Show the test order if the following conditions are met:
// 1. The current visit is in-patient
// 2. The test order has been paid in full
// 3. The patient is an emergency patient
const TestOrderAction: React.FC<TestOrderProps> = React.memo((props) => {
  const { order, modalName, additionalProps, actionText, medicationRequestBundle } = props;
  const { t } = useTranslation();

  const orderUuid = order?.uuid ?? medicationRequestBundle?.request?.id;
  const patientUuid = order?.patient?.uuid ?? medicationRequestBundle?.request?.subject?.reference?.split('/')[1];
  const { isLoading, hasPendingPayment } = useTestOrderBillStatus(orderUuid, patientUuid);

  const handleModalClose = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith(additionalProps?.mutateUrl as string), undefined, {
      revalidate: true,
    });
  }, [additionalProps?.mutateUrl]);

  const launchModal = useCallback(() => {
    // TODO: Remove this once we have dispensing form using workspaces
    if (props.handleOpenDispenseForm) {
      props.handleOpenDispenseForm();
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
  }, [order, additionalProps, modalName, handleModalClose]);

  if (isLoading) {
    return (
      <Button kind="ghost" size="md" disabled>
        <InlineLoading description={t('verifyingBillStatus', 'Verifying bill status...')} status="active" />
      </Button>
    );
  }

  if (order?.fulfillerStatus === FulfillerStatus.IN_PROGRESS) {
    return null;
  }

  const buttonText = hasPendingPayment
    ? t('unsettledBill', 'Unsettled bill.')
    : Object.hasOwn(props, 'medicationRequestBundle')
    ? actionText ?? t('dispense', 'Dispense')
    : actionText ?? t('pickLabRequest', 'Pick Lab Request');

  return (
    <Button kind="primary" disabled={hasPendingPayment} key={`${orderUuid}`} onClick={launchModal}>
      {buttonText}
    </Button>
  );
}, areEqual);

export default TestOrderAction;
