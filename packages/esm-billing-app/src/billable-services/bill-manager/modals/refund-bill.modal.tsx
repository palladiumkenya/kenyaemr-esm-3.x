import React, { useState } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button, Loading } from '@carbon/react';
import styles from './cancel-bill.scss';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { processBillItems } from '../../../billing.resource';
import { mutate } from 'swr';
import { LineItem, MappedBill } from '../../../types';

export const RefundBillModal: React.FC<{
  onClose: () => void;
  bill: MappedBill;
  lineItem: LineItem;
}> = ({ onClose, bill, lineItem }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const refundBillItems = () => {
    const lineItemToBeRefunded = {
      item: lineItem.uuid,
      quantity: lineItem.quantity,
      price: -lineItem.price,
      priceName: lineItem.priceName,
      priceUuid: lineItem.priceUuid,
      lineItemOrder: lineItem.lineItemOrder,
      paymentStatus: lineItem.paymentStatus,
      billableService: lineItem.billableService.split(':').at(0),
    };

    const billWithRefund = {
      cashPoint: bill.cashPointUuid,
      cashier: bill.cashier.uuid,
      lineItems: [lineItemToBeRefunded],
      payments: bill.payments,
      patient: bill.patientUuid,
      status: bill.status,
    };

    setIsLoading(true);
    onClose();
    processBillItems(billWithRefund)
      .then(() => {
        mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/cashier/bill'), undefined, {
          revalidate: true,
        });
        showSnackbar({
          title: t('billItems', 'Refund Items'),
          subtitle: 'Item has been successfully refunded.',
          kind: 'success',
          timeoutInMs: 3000,
        });
      })
      .catch((error) => {
        showSnackbar({ title: 'An error occurred trying to refund item', kind: 'error', subtitle: error.message });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <React.Fragment>
      <ModalHeader onClose={onClose} className={styles.modalHeaderLabel} closeModal={onClose}>
        {t('refundBill', 'Refund Bill')}
      </ModalHeader>
      <ModalBody className={styles.modalHeaderHeading}>
        {t('refundBillDescription', 'Are you sure you want to refund this bill? Proceed cautiously.')}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={refundBillItems}>
          {isLoading ? (
            <div className={styles.loading_wrapper}>
              <Loading className={styles.button_spinner} withOverlay={false} small />
              {t('processingPayment', 'Processing Payment')}
            </div>
          ) : (
            t('refund', 'Refund')
          )}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
