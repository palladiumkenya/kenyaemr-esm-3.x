import React, { useState } from 'react';
import {
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  StructuredListWrapper,
  Layer,
  Checkbox,
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

  const handleOpenEditLineItemWorkspace = (lineItem: LineItem) => {
    launchWorkspace('edit-bill-form', {
      workspaceTitle: t('editBillForm', 'Edit Bill Form'),
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
            <StructuredListRow>
              <StructuredListCell>
                {lineItem.item === '' ? extractString(lineItem.billableService) : extractString(lineItem.item)}
              </StructuredListCell>
              <StructuredListCell>{lineItem.quantity}</StructuredListCell>
              <StructuredListCell>{convertToCurrency(lineItem.price)}</StructuredListCell>
              <StructuredListCell>{convertToCurrency(lineItem.price * lineItem.quantity)}</StructuredListCell>
              <StructuredListCell>
                <OverflowMenu aria-label="overflow-menu" align="bottom">
                  <OverflowMenuItem itemText="Edit Item" onClick={() => handleOpenEditLineItemWorkspace(lineItem)} />
                  <OverflowMenuItem itemText="Cancel Item" onClick={handleOpenCancelLineItemModal} />
                  <OverflowMenuItem itemText="Delete Item" onClick={handleOpenDeleteLineItemModal} />
                </OverflowMenu>
              </StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

export default BillLineItems;
