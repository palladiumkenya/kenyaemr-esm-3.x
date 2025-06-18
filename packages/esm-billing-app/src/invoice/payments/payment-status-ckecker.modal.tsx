import {
  Button,
  ButtonSet,
  ContentSwitcher,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Switch,
  TextInput,
} from '@carbon/react';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { processBillPayment, usePaymentModes } from '../../billing.resource';
import { BillingConfig } from '../../config-schema';
import { useClockInStatus } from '../../payment-points/use-clock-in-status';
import { LineItem, MappedBill } from '../../types';
import { checkPaymentStatus } from './payments.resource';
import styles from './payments.scss';
import { createPaymentPayload } from './utils';
type PaymentStatusCheckerModalProps = {
  onClose: () => void;
  paymentMade?: boolean;
  onPaymentMadestatusChange?: (paid: boolean) => void;
  bill: MappedBill;
  selectedLineItems: Array<LineItem>;
};
const PaymentStatusCheckerModal: React.FC<PaymentStatusCheckerModalProps> = ({
  onClose,
  onPaymentMadestatusChange,
  paymentMade,
  bill,
  selectedLineItems,
}) => {
  const { t } = useTranslation();
  const [transactionid, setTransactionid] = useState<string>();
  const { globalActiveSheet } = useClockInStatus();
  const { mobileMoneyPaymentModeUUID } = useConfig<BillingConfig>();
  const { paymentModes, isLoading } = usePaymentModes();
  const [checking, setChecking] = useState(false);
  const mobilemoneypaymentMethod = useMemo(
    () => paymentModes.find((mode) => mode.uuid === mobileMoneyPaymentModeUUID),
    [paymentModes, mobileMoneyPaymentModeUUID],
  );

  const handleCheckPaymentStatus = useCallback(async () => {
    try {
      setChecking(true);
      const res = await checkPaymentStatus(transactionid);
      if (res?.data?.success) {
        const totalAmountTendered = Number(res.data.data.TransAmount) || 0;
        const amountDue = Number(bill.totalAmount) - (Number(bill.tenderedAmount) + Number(totalAmountTendered));
        const paymentPayload = createPaymentPayload(
          bill,
          bill.patientUuid,
          [{ referenceCode: transactionid, amount: totalAmountTendered, method: mobilemoneypaymentMethod }],
          amountDue,
          selectedLineItems,
          globalActiveSheet,
        );
        await processBillPayment(paymentPayload, bill.uuid);
        showSnackbar({
          title: t('success', 'Success'),
          kind: 'success',
          subtitle: t('paymentReceived', 'Payment received'),
        });
        const url = `/ws/rest/v1/cashier/bill/${bill.uuid}`;
        mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
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
    } finally {
      setChecking(false);
    }
  }, [transactionid, selectedLineItems, onClose, mobilemoneypaymentMethod, globalActiveSheet, bill, t]);
  return (
    <React.Fragment>
      <ModalHeader className={styles.heading} closeModal={onClose}>
        {t('checkpaymentStatus', 'Check payment status')}
      </ModalHeader>
      <ModalBody>
        <ContentSwitcher
          size="md"
          selectedIndex={paymentMade ? 1 : 0}
          onChange={({ name }) => {
            onPaymentMadestatusChange?.(name === 'paymentMade');
          }}>
          <Switch name="paymentNotMade" text={t('paymentNotMade', 'Payment not made')} />
          <Switch name="paymentMade" text={t('paymentMade', 'Payments already made')} />
        </ContentSwitcher>
        <TextInput
          value={transactionid}
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
            disabled={!transactionid?.length || isLoading || checking}
            onClick={handleCheckPaymentStatus}
            className={styles.button}>
            {isLoading || checking ? (
              <InlineLoading
                description={t('checkingPaymentStatus', 'Check payment status') + '...'}
                iconDescription={t('loading', 'Loading')}
              />
            ) : (
              t('check', 'Check')
            )}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default PaymentStatusCheckerModal;
