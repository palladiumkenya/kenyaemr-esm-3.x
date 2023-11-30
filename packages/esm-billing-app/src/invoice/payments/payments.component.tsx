import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import styles from './payments.scss';
import { useTranslation } from 'react-i18next';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import PaymentOptions from './payment-options.component';

type PaymentProps = {};

const Payments: React.FC<PaymentProps> = () => {
  const { t } = useTranslation();
  const [paymentControls, setPaymentControls] = useState([]);
  return (
    <div className={styles.paymentContainer}>
      <CardHeader title={t('payments', 'Payments')}>
        <span></span>
      </CardHeader>
      <Button
        onClick={() => setPaymentControls((prevState) => [...prevState, { value: 1 }])}
        className={styles.paymentButtons}
        renderIcon={(props) => <Add size={24} {...props} />}
        iconDescription="Add">
        {t('addPaymentOptions', 'Add payment option')}
      </Button>
      <div>
        {paymentControls.map((el) => (
          <PaymentOptions />
        ))}
      </div>
    </div>
  );
};

export default Payments;
