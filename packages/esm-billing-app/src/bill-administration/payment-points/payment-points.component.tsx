import { Button } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../../billing-header/billing-header.component';
import styles from './payment-points-styles.scss';
import { PaymentPointsTable } from './payment-points-table.component';

const PaymentPoints = () => {
  const { t } = useTranslation();

  const openPaymentPointModal = () => {
    const dispose = showModal('create-payment-point', {
      closeModal: () => dispose(),
    });
  };

  // TODO: Add a route to the payment point

  return (
    <div>
      <BillingHeader title={t('paymentPoints', 'Payment Points')} />
      <div className={styles.paymentPoints}>
        <Button kind="ghost" onClick={() => openPaymentPointModal()} className={styles.createPaymentPointButton}>
          {t('createPaymentPoint', 'Create Payment Point')}
        </Button>
        <PaymentPointsTable />
      </div>
    </div>
  );
};

export default PaymentPoints;
