import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { LineItem, MappedBill } from '../../../types';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';

type EditLineItemProps = {
  lineItem: LineItem;
  bill: MappedBill;
};

const EditLineItem: React.FC<EditLineItemProps> = ({ lineItem, bill }) => {
  const { t } = useTranslation();
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
