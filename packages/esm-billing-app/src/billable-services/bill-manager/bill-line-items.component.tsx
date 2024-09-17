import React, { useState } from 'react';
import {
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  StructuredListWrapper,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { convertToCurrency, extractString } from '../../helpers';
import { LineItem, MappedBill } from '../../types';
import styles from './bill-manager.scss';
import { launchWorkspace, showModal } from '@openmrs/esm-framework';

const BillLineItems: React.FC<{ bill: MappedBill }> = ({ bill }) => {
  const { t } = useTranslation();

  return (
    <Layer>
      <StructuredListWrapper className={styles.billListContainer} selection={true} isCondensed>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>{t('billItem', 'Bill item')}</StructuredListCell>
            <StructuredListCell head>{t('quantity', 'Quantity')}</StructuredListCell>
            <StructuredListCell head>{t('unitPrice', 'Unit Price')}</StructuredListCell>
            <StructuredListCell head>{t('total', 'Total')}</StructuredListCell>
            <StructuredListCell head>{t('actions', 'Actions')}</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {bill?.lineItems.map((lineItem) => (
            <LineItemRow bill={bill} lineItem={lineItem} key={lineItem.uuid} />
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

const LineItemRow = ({ lineItem, bill }: { lineItem: LineItem; bill: MappedBill }) => {
  const refundedLineItemUUIDs = bill.lineItems.filter((li) => Math.sign(li.price) === -1).map((li) => li.uuid);
  const isRefundedLineItem = refundedLineItemUUIDs.includes(lineItem.uuid);

  const refundedLineItemBillableServiceUUIDs = bill.lineItems
    .filter((li) => Math.sign(li.price) === -1)
    .map((li) => li.billableService.split(':').at(0));

  const isRefundedBillableService = refundedLineItemBillableServiceUUIDs.includes(
    lineItem.billableService.split(':').at(0),
  );

  const { t } = useTranslation();

  const handleOpenEditLineItemWorkspace = (lineItem: LineItem) => {
    launchWorkspace('edit-bill-form', {
      workspaceTitle: t('editBillForm', 'Edit Bill Form'),
      lineItem,
      bill,
    });
  };

  const handleOpenRefundLineItemModal = (lineItem: LineItem) => {
    const dispose = showModal('refund-bill-modal', {
      onClose: () => dispose(),
      bill,
      lineItem,
    });
  };

  const handleOpenCancelLineItemModal = () => {
    const dispose = showModal('cancel-bill-modal', {
      onClose: () => dispose(),
    });
  };

  const handleOpenDeleteLineItemModal = () => {
    const dispose = showModal('delete-bill-modal', {
      onClose: () => dispose(),
    });
  };

  return (
    <StructuredListRow className={isRefundedLineItem && styles.refundedItem}>
      <StructuredListCell>
        {lineItem.item === '' ? extractString(lineItem.billableService) : extractString(lineItem.item)}
      </StructuredListCell>
      <StructuredListCell>{lineItem.quantity}</StructuredListCell>
      <StructuredListCell>{convertToCurrency(lineItem.price)}</StructuredListCell>
      <StructuredListCell>{convertToCurrency(lineItem.price * lineItem.quantity)}</StructuredListCell>
      <StructuredListCell>
        <OverflowMenu aria-label="overflow-menu">
          <OverflowMenuItem itemText="Edit Item" onClick={() => handleOpenEditLineItemWorkspace(lineItem)} />
          <OverflowMenuItem itemText="Cancel Item" onClick={handleOpenCancelLineItemModal} />
          {!isRefundedBillableService && (
            <OverflowMenuItem itemText="Refund Item" onClick={() => handleOpenRefundLineItemModal(lineItem)} />
          )}
          <OverflowMenuItem itemText="Delete Item" onClick={handleOpenDeleteLineItemModal} />
        </OverflowMenu>
      </StructuredListCell>
    </StructuredListRow>
  );
};

export default BillLineItems;
