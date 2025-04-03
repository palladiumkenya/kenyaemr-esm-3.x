import React from 'react';
import { GenericOrderButton } from './generic-button.component';
import { MedicationOrderButton } from './medication-order-button.component';
const ORDER_TYPE = {
  MEDICATION: 'Medication',
  LAB: 'Test Order',
  // For Procedure and Imaging Order types we use concept classes to differentiate them,
  // we can use the concept class to determine which button to show
  PROCEDURE: '8d490bf4-c2cc-11de-8d13-0010c6dffd0f',
  IMAGING: '8caa332c-efe4-4025-8b18-3398328e1323',
};

const OrderActionButton: React.FC<Record<string, any>> = (props) => {
  const conceptClass = props?.order?.concept?.conceptClass?.uuid;
  if (Object.hasOwn(props, 'medicationRequestBundle')) {
    const { medicationRequestBundle, modalName, additionalProps, actionText, closeable } = props;
    return (
      <MedicationOrderButton
        medicationRequestBundle={medicationRequestBundle}
        modalName={modalName}
        additionalProps={additionalProps}
        actionText={actionText}
        closeable={closeable}
      />
    );
  }

  if (props.order?.orderType?.name === ORDER_TYPE.LAB) {
    const { order, modalName, additionalProps, actionText } = props;
    return (
      <GenericOrderButton
        order={order}
        modalName={modalName}
        additionalProps={additionalProps}
        actionText={actionText}
      />
    );
  }

  if (conceptClass === ORDER_TYPE.PROCEDURE) {
    const { order, modalName, additionalProps, actionText } = props;

    return (
      <GenericOrderButton
        order={order}
        modalName={modalName}
        additionalProps={additionalProps}
        actionText={actionText}
      />
    );
  }

  if (conceptClass === ORDER_TYPE.IMAGING) {
    const { order, modalName, additionalProps, actionText } = props;
    return (
      <GenericOrderButton
        order={order}
        modalName={modalName}
        additionalProps={additionalProps}
        actionText={actionText}
      />
    );
  }

  return null;
};

export default OrderActionButton;
