import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { LineItem, MappedBill, PaymentStatus } from '../../../types';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';

type EditLineItemProps = {
  lineItem: LineItem;
  bill: MappedBill;
};

const EditLineItem: React.FC<EditLineItemProps> = ({ lineItem, bill }) => {
  const { t } = useTranslation();

  if (lineItem.paymentStatus == PaymentStatus.PAID) {
    return null;
  }

  const handleOpenEditLineItemWorkspace = (lineItem: LineItem) => {
    launchWorkspace('edit-bill-form', {
      workspaceTitle: t('editBillForm', 'Edit Bill Form'),
      lineItem,
      bill,
    });
  };
  return (
    <OverflowMenuItem itemText={t('editItem', 'Edit item')} onClick={() => handleOpenEditLineItemWorkspace(lineItem)} />
  );
};

export default EditLineItem;
