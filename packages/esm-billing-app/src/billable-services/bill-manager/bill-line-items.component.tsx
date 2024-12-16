import React from 'react';
import {
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  StructuredListWrapper,
  Layer,
  OverflowMenu,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { convertToCurrency, extractString } from '../../helpers';
import { LineItem, MappedBill, PaymentStatus } from '../../types';
import styles from './bill-manager.scss';
import { ExtensionSlot } from '@openmrs/esm-framework';

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
            <StructuredListCell head>{t('status', 'Status')}</StructuredListCell>
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
  const { t } = useTranslation();
  const refundedLineItemUUIDs = bill.lineItems.filter((li) => Math.sign(li.price) === -1).map((li) => li.uuid);
  const isRefundedLineItem = refundedLineItemUUIDs.includes(lineItem.uuid);

  const refundedLineItemBillableServiceUUIDs = bill.lineItems
    .filter((li) => Math.sign(li.price) === -1)
    .map((li) => li.billableService.split(':').at(0));

  const isRefundedBillableService = refundedLineItemBillableServiceUUIDs.includes(
    lineItem.billableService.split(':').at(0),
  );

  const extensionHeight = lineItem.paymentStatus === PaymentStatus.PAID ? '3em' : '5em';

  return (
    <StructuredListRow className={isRefundedLineItem && styles.refundedItem}>
      <StructuredListCell>
        {lineItem.item === '' ? lineItem.billableService.split(':')[1] : extractString(lineItem.item)}
      </StructuredListCell>
      <StructuredListCell>{lineItem.quantity}</StructuredListCell>
      <StructuredListCell>{convertToCurrency(lineItem.price)}</StructuredListCell>
      <StructuredListCell>{convertToCurrency(lineItem.price * lineItem.quantity)}</StructuredListCell>
      <StructuredListCell>{lineItem.paymentStatus}</StructuredListCell>

      <StructuredListCell>
        <OverflowMenu aria-label="overflow-menu">
          <ExtensionSlot
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: extensionHeight }}
            className="cds--overflow-menu-options__option"
            name="bill-actions-overflow-menu-slot"
            state={{ lineItem, bill, isRefundedBillableService }}
          />
        </OverflowMenu>
      </StructuredListCell>
    </StructuredListRow>
  );
};

export default BillLineItems;
