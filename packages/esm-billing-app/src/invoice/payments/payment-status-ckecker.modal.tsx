import {
  Button,
  ButtonSet,
  ContentSwitcher,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Switch,
  TextInput,
} from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { checkPaymentStatus } from './payments.resource';
import styles from './payments.scss';
type PaymentStatusCheckerModalProps = {
  onClose: () => void;
  paymentMade?: boolean;
  onPaymentMadestatusChange?: (paid: boolean) => void;
};
const PaymentStatusCheckerModal: React.FC<PaymentStatusCheckerModalProps> = ({
  onClose,
  onPaymentMadestatusChange,
  paymentMade,
}) => {
  const { t } = useTranslation();
  const [transactionid, setTransactionid] = useState<string>();
  const handleCheckPaymentStatus = useCallback(async () => {
    try {
      const res = await checkPaymentStatus(transactionid);
      if (res?.data?.success) {
        // TODO - uPDATE BILL
        showSnackbar({
          title: t('success', 'Success'),
          kind: 'success',
          subtitle: t('patmentAlreadySettled', 'Payment received'),
        });
        onClose?.();
      } else {
        showSnackbar({
          title: t('paymentFailure', 'Payment Failure'),
          kind: 'error',
          subtitle: res?.data?.message || t('paymentNotSettled', 'Payment not settled'),
        });
      }
    } catch (error: any) {
      showSnackbar({ title: t('error', 'Error'), kind: 'error', subtitle: error?.message });
    }
  }, [transactionid, t]);
  return (
    <React.Fragment>
      <ModalHeader className={styles.heading} closeModal={onClose}>
        {t('checkpaymentStatus', 'Check payment status')}
      </ModalHeader>
      <ModalBody>
        <ContentSwitcher
          selectedIndex={paymentMade ? 1 : 0}
          onChange={({ name }) => {
            onPaymentMadestatusChange?.(name === 'paymentMade');
          }}>
          <Switch name="paymentNotMade" text={t('paymentNotMade', 'Payment Not made')} />
          <Switch name="paymentMade" text={t('paymentMade', 'Payments already made')} />
        </ContentSwitcher>
        <TextInput
          value={transactionid}
          defaultWidth={300}
          id="text-input-1"
          labelText={t('transactionId', 'Transaction Id')}
          placeholder={t('exampletransactionId', 'e.g TRMEWECEDD')}
          size="md"
          type="text"
          helperText={t('mpesaTransactionId', 'Mpesa transaction Id')}
          onChange={({ target: { value } }) => setTransactionid(value)}
        />
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={onClose} className={styles.button}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            kind="primary"
            disabled={!transactionid?.length}
            onClick={handleCheckPaymentStatus}
            className={styles.button}>
            {t('check', 'Check')}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default PaymentStatusCheckerModal;
