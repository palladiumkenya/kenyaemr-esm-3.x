import { Button } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../billing-header/billing-header.component';
import styles from './payment-points-styles.scss';
import { PaymentPointsTable } from './payment-points-table.component';

export const PaymentPoints = () => {
  const { t } = useTranslation();

  const openPaymentPointModal = () => {
    const dispose = showModal('create-payment-point', {
      closeModal: () => dispose(),
    });
  };

  return (
    <div>
      <BillingHeader title={t('paymentPoints', 'Payment Points')} />
      <div className={styles.paymentPoints}>
        <Button onClick={() => openPaymentPointModal()} className={styles.createPaymentPointButton}>
          Create Payment Point
        </Button>
        <PaymentPointsTable />
      </div>
    </div>
  );
};
