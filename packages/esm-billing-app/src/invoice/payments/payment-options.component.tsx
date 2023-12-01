import React from 'react';
import { ComboBox, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './payment-methods.scss';

type PaymentOptionsProps = {};

const PaymentOptions: React.FC<PaymentOptionsProps> = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.paymentMethodContainer}>
      <ComboBox
        light
        onChange={() => {}}
        id="paymentMethod"
        items={[
          { id: 'MPESA', text: 'MPESA' },
          { id: 'CASH', text: 'CASH' },
          { id: 'BANKDEPOSIT', text: 'BANK DEPOSIT' },
        ]}
        itemToString={(item) => (item ? item.text : '')}
        titleText={t('paymentMethod', 'Payment method')}
      />
      <TextInput light id="amount" type="text" labelText={t('amount', 'Amount')} />
      <TextInput light id="referenceNumber" type="text" labelText={t('referenceNumber', 'Reference number')} />
    </div>
  );
};

export default PaymentOptions;
