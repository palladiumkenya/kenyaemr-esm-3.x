import { OverflowMenuItem } from '@carbon/react';
import React from 'react';
import { LineItem, MappedBill, PaymentStatus } from '../../../types';
import { showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

type RefundLineItemProps = {
  lineItem: LineItem;
  bill: MappedBill;
  isRefundedBillableService: boolean;
};

const RefundLineItem: React.FC<RefundLineItemProps> = ({ lineItem, bill, isRefundedBillableService }) => {
  const { t } = useTranslation();
  const handleOpenRefundLineItemModal = () => {
    const dispose = showModal('refund-bill-modal', {
      onClose: () => dispose(),
      bill,
      lineItem,
    });
  };

  if (isRefundedBillableService) {
    return null;
  }

  if (lineItem.paymentStatus !== PaymentStatus.PAID) {
    return null;
  }

  return <OverflowMenuItem itemText={t('refundItem', 'Refund item')} onClick={() => handleOpenRefundLineItemModal()} />;
};

export default RefundLineItem;
