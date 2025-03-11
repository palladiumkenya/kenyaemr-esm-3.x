import { InlineLoading, Button } from '@carbon/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { useOrderBill, useTestOrderBillStatus } from './test-order-action.resource';
import { launchWorkspace, showModal } from '@openmrs/esm-framework';
import { Order } from '@openmrs/esm-patient-common-lib';
import { createMedicationDispenseProps } from './dispense.resource';
import { useStockItemQuantity } from '../useBillableItem';
import { useBillableServices } from '../../billable-service.resource';
import styles from './test-order-action.scss';

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
  const drugUuid = medicationRequestBundle?.request?.medicationReference?.reference?.split('/')[1];
  const { billableServices } = useBillableServices();
  const { stockItemQuantity, stockItemUuid } = useStockItemQuantity(drugUuid);
  const billableItem =
    billableServices?.filter((service) => {
      const stockItem = service?.stockItem.split(':')[0];
      return stockItem === stockItemUuid;
    }) || [];
  const { itemHasBill } = useOrderBill(patientUuid, orderUuid);
  const drugOrderUuid = medicationRequestBundle?.request?.id;
  // Handle modal close and revalidation
  const handleModalClose = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith(additionalProps?.mutateUrl as string), undefined, {
      revalidate: true,
    });
  }, [additionalProps?.mutateUrl]);

  const launchModal = useCallback(() => {
    if (stockItemQuantity > 0 && itemHasBill.length < 1 && billableItem.length > 0) {
      const disposeBill = showModal(modalName ?? 'create-bill-item-modal', {
        closeModal: () => {
          handleModalClose();
          disposeBill();
        },
        medicationRequestBundle,
      });
      return;
    }

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
  }, [
    isDispenseOrder,
    modalName,
    order,
    additionalProps,
    dispenseFormProps,
    handleModalClose,
    medicationRequestBundle,
    stockItemQuantity,
    billableItem.length,
    itemHasBill.length,
  ]);

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

  const buttonText = (() => {
    if (hasPendingPayment) {
      return t('unsettledBill', 'Unsettled bill');
    }

    if (stockItemQuantity < 1 && drugOrderUuid) {
      return t('outOfStock', 'Out of Stock');
    }

    if (stockItemQuantity > 0 && itemHasBill.length === 0 && billableItem.length > 0 && drugOrderUuid) {
      return t('bill', 'Bill');
    }
    return isDispenseOrder
      ? actionText ?? t('dispense', 'Dispense')
      : actionText ?? t('pickLabRequest', 'Pick Lab Request');
  })();

  return (
    <Button
      kind="primary"
      className={!isDispenseOrder ? styles.actionButton : ''}
      size={!isDispenseOrder ? 'md' : ''}
      disabled={hasPendingPayment || (stockItemQuantity < 1 && drugOrderUuid)}
      onClick={launchModal}>
      {buttonText}
    </Button>
  );
};

export default TestOrderAction;
