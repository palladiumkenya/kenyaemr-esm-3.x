import React from 'react';
import { LabOrderButton } from './lab-order-button.component';
import { MedicationOrderButton } from './medication-order-button.component';

const OrderActionButton: React.FC<Record<string, any>> = (props) => {
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

  if (props.orderType === 'lab') {
    const { order, modalName, additionalProps, actionText } = props;
    return (
      <LabOrderButton order={order} modalName={modalName} additionalProps={additionalProps} actionText={actionText} />
    );
  }

  return null;
};

export default OrderActionButton;
