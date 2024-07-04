import { OverflowMenuItem } from '@carbon/react';
import { Order } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTestOrderBillStatus } from './test-order-action.resource';
import { showModal } from '@openmrs/esm-framework';

type TestOrderProps = { order: Order };

enum FulfillerStatus {
  IN_PROGRESS = 'IN_PROGRESS',
}

const TestOrderAction: React.FC<TestOrderProps> = ({ order }) => {
  const { t } = useTranslation();
  const { isLoading, hasPendingPayment } = useTestOrderBillStatus(order.uuid, order.patient.uuid);

  const launchModal = useCallback(() => {
    const dispose = showModal('pickup-lab-request-modal', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  // Show the test order if the following conditions are met:
  // 1. The current visit is in-patient
  // 2. The test order has been paid in full
  // 3. The patient is an emergency patient

  // If the order is in progress, do not show the action
  if (order.fulfillerStatus === FulfillerStatus.IN_PROGRESS) {
    return null;
  }

  if (isLoading) {
    return <OverflowMenuItem itemText={t('loading', 'Loading...')} />;
  }

  return (
    <OverflowMenuItem
      onClick={launchModal}
      disabled={hasPendingPayment}
      itemText={
        hasPendingPayment ? t('unsettledBill', 'Unsettled bill for test.') : t('pickLabRequest', 'Pick Lab Request')
      }
    />
  );
};

export default TestOrderAction;
