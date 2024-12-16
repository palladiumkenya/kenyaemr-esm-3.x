import React from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../../billing-header/billing-header.component';
import { PaymentDashboard } from './payment-dashboard.component';

export const PaymentHistory = () => {
  const { t } = useTranslation();

  return (
    <div>
      <BillingHeader title={t('paymentHistory', 'Payment History')} />
      <PaymentDashboard />
    </div>
  );
};
