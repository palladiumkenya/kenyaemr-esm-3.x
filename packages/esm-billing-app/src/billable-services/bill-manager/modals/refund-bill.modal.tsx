import React, { useState, useCallback } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button, Loading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { processBillItems } from '../../../billing.resource';
import { mutate } from 'swr';
import { LineItem, MappedBill, PaymentStatus } from '../../../types';
import styles from './cancel-bill.scss';

interface RefundBillModalProps {
  onClose: () => void;
  bill: MappedBill;
  lineItem: LineItem;
}

export const RefundBillModal: React.FC<RefundBillModalProps> = ({ onClose, bill, lineItem }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const itemUuid = lineItem.item.split(':')[0];
  const billableServiceUuid = lineItem.billableService.split(':')[0];

  const refundBillItems = useCallback(async () => {
    const lineItemToBeRefunded = {
      quantity: lineItem.quantity,
      price: -lineItem.price,
      priceName: lineItem.priceName,
      priceUuid: lineItem.priceUuid,
      lineItemOrder: lineItem.lineItemOrder,
      paymentStatus: PaymentStatus.CREDITED,
      ...(itemUuid && { item: itemUuid }),
      ...(billableServiceUuid && { billableService: billableServiceUuid }),
    };

    const billPayments = bill.payments.map((payment) => ({
      instanceType: payment.instanceType.uuid,
      attributes: [],
      amount: payment.amount,
      amountTendered: payment.amountTendered,
    }));

    const billWithRefund = {
      cashPoint: bill.cashPointUuid,
      cashier: bill.cashier.uuid,
      lineItems: [lineItemToBeRefunded],
      payments: billPayments,
      patient: bill.patientUuid,
      status: bill.status,
    };

    setIsLoading(true);
    onClose();

    try {
      await processBillItems(billWithRefund);
      mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/cashier/bill'), undefined, {
        revalidate: true,
      });
      showSnackbar({
        title: t('refundItems', 'Refund Items'),
        subtitle: t('refundSuccessful', 'Item has been successfully refunded.'),
        kind: 'success',
        timeoutInMs: 5000,
      });
    } catch (error) {
      showSnackbar({
        title: t('refundError', 'An error occurred trying to refund item'),
        kind: 'error',
        subtitle: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [bill, lineItem, onClose, t, billableServiceUuid, itemUuid]);

  return (
    <>
      <ModalHeader onClose={onClose} className={styles.modalHeaderLabel}>
        {t('refundBill', 'Refund Bill')}
      </ModalHeader>
      <ModalBody className={styles.modalHeaderHeading}>
        {lineItem.paymentStatus === PaymentStatus.PAID
          ? t('refundBillDescription', 'Are you sure you want to refund this bill? Proceed cautiously.')
          : t('refundBillDescription', 'Refund is only allowed for paid bills')}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        {lineItem.paymentStatus === PaymentStatus.PAID && (
          <Button kind="danger" onClick={refundBillItems} disabled={isLoading}>
            {isLoading ? (
              <div className={styles.loading_wrapper}>
                <Loading className={styles.button_spinner} withOverlay={false} small />
                {t('processingPayment', 'Processing Payment')}
              </div>
            ) : (
              t('refund', 'Refund')
            )}
          </Button>
        )}
      </ModalFooter>
    </>
  );
};
