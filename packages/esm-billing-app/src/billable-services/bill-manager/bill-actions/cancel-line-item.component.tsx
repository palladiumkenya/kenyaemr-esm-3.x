import React from 'react';
import { launchWorkspace } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { LineItem, MappedBill, PaymentStatus } from '../../../types';
import Payments from '../../../invoice/payments/payments.component';

type CancelLineItemProps = {
  lineItem: LineItem;
  bill: MappedBill;
};

const CancelLineItem: React.FC<CancelLineItemProps> = ({ lineItem, bill }) => {
  const { t } = useTranslation();

  if (lineItem.paymentStatus == PaymentStatus.PAID) {
    return null;
  }
  const handleCancelLineItemWorkspace = () => {
    launchWorkspace('cancel-bill-workspace', {
      workspaceTitle: t('cancelBillForm', 'Cancel Bill Form'),
      bill,
      lineItem,
    });
  };

  return <OverflowMenuItem itemText={t('cancelItem', 'Cancel item')} onClick={handleCancelLineItemWorkspace} />;
};

export default CancelLineItem;
