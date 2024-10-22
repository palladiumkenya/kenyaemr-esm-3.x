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
};

enum FulfillerStatus {
  IN_PROGRESS = 'IN_PROGRESS',
}

// Memoize the comparison function
const areEqual = (prevProps: TestOrderProps, nextProps: TestOrderProps) => {
  if (prevProps.order.uuid !== nextProps.order.uuid) {
    return false;
  }
  if (prevProps.modalName !== nextProps.modalName) {
    return false;
  }
  if (prevProps.actionText !== nextProps.actionText) {
    return false;
  }

  // Only stringify additionalProps if everything else matches
  return JSON.stringify(prevProps.additionalProps) === JSON.stringify(nextProps.additionalProps);
};

// Show the test order if the following conditions are met:
// 1. The current visit is in-patient
// 2. The test order has been paid in full
// 3. The patient is an emergency patient
const TestOrderAction: React.FC<TestOrderProps> = React.memo(({ order, modalName, additionalProps, actionText }) => {
  const { t } = useTranslation();

  const orderUuid = order?.uuid ?? '';
  const patientUuid = order?.patient?.uuid ?? '';

  const { isLoading, hasPendingPayment } = useTestOrderBillStatus(orderUuid, patientUuid);

  const handleModalClose = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith(additionalProps?.mutateUrl as string), undefined, {
      revalidate: true,
    });
  }, [additionalProps?.mutateUrl]);

  const launchModal = useCallback(() => {
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
        <InlineLoading description={t('verifyingOrderBillStatus', 'Verifying order bill status...')} status="active" />
      </Button>
    );
  }

  if (order.fulfillerStatus === FulfillerStatus.IN_PROGRESS) {
    return null;
  }

  const buttonText = hasPendingPayment
    ? t('unsettledBill', 'Unsettled bill.')
    : actionText ?? t('pickLabRequest', 'Pick Lab Request');

  return (
    <Button kind="primary" disabled={hasPendingPayment} onClick={launchModal}>
      {buttonText}
    </Button>
  );
}, areEqual);

export default TestOrderAction;
