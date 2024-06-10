import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ModalBody, ModalHeader, TextInput, Layer } from '@carbon/react';
import styles from './initiate-payment.scss';
import { Controller, useForm } from 'react-hook-form';
import { MappedBill } from '../../../types';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatPhoneNumber } from '../utils';
import { Buffer } from 'buffer';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { initiateStkPush } from '../../../m-pesa/mpesa-resource';

const InitiatePaymentSchema = z.object({
  phoneNumber: z
    .string()
    .nonempty({ message: 'Phone number is required' })
    .regex(/^\d{10}$/, { message: 'Phone number must be numeric and 10 digits' }),
  billAmount: z.string().nonempty({ message: 'Amount is required' }),
});

export interface InitiatePaymentDialogProps {
  closeModal: () => void;
  bill: MappedBill;
}

const InitiatePaymentDialog: React.FC<InitiatePaymentDialogProps> = ({ closeModal, bill }) => {
  const { t } = useTranslation();
  const { mpesaCallbackUrl, passKey, shortCode, authorizationUrl, initiateUrl } = useConfig();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<any>({
    mode: 'all',
    defaultValues: {
      billAmount: String(bill.totalAmount),
    },
    resolver: zodResolver(InitiatePaymentSchema),
  });

  const onSubmit = async (data) => {
    try {
      const timeStamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, -3);
      const phoneNumber = formatPhoneNumber(data.phoneNumber);
      const amountBilled = data.billAmount;
      const password = shortCode + passKey + timeStamp;
      const callBackUrl = mpesaCallbackUrl;
      const Password = Buffer.from(password).toString('base64');
      const accountReference = `${mflCodeValue}#${bill.receiptNumber}`;

      const payload = {
        BusinessShortCode: shortCode,
        Password: Password,
        Timestamp: timeStamp,
        TransactionType: 'CustomerPayBillOnline',
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: callBackUrl,
        AccountReference: accountReference,
        TransactionDesc: 'KenyaEMRPay',
        Amount: amountBilled,
      };

      await initiateStkPush(payload, initiateUrl, authorizationUrl);
      showSnackbar({
        title: t('stkPush', 'STK Push'),
        subtitle: t('stkPushSucess', 'STK Push send successfully'),
        kind: 'success',
        timeoutInMs: 3500,
        isLowContrast: true,
      });
      closeModal();
    } catch (err) {
      const errorMessage =
        err.response?.data?.errorMessage || err.message || t('stkPushError', 'STK Push request failed');
      showSnackbar({
        title: t('stkPush', 'STK Push'),
        subtitle: errorMessage,
        kind: 'error',
        timeoutInMs: 3500,
        isLowContrast: true,
      });
    }
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} />
      <ModalBody>
        <Form className={styles.form}>
          <h4>{t('paymentPayment', 'Bill Payment')}</h4>
          <section className={styles.section}>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <Layer>
                  <TextInput
                    {...field}
                    size="md"
                    labelText={t('Phone Number', 'Phone Number')}
                    placeholder={t('Phone Number', 'Phone Number')}
                    invalid={!!errors.phoneNumber}
                    invalidText={errors.phoneNumber?.message}
                  />
                </Layer>
              )}
            />
          </section>
          <section className={styles.section}>
            <Controller
              control={control}
              name="billAmount"
              render={({ field }) => (
                <Layer>
                  <TextInput
                    {...field}
                    size="md"
                    labelText={t('billAmount', 'Bill Amount')}
                    placeholder={t('billAmount', 'Bill Amount')}
                    invalid={!!errors.billAmount}
                    invalidText={errors.billAmount?.message}
                  />
                </Layer>
              )}
            />
          </section>
          <section>
            <Button kind="secondary" className={styles.buttonLayout} onClick={closeModal}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button type="submit" className={styles.button} onClick={handleSubmit(onSubmit)} disabled={!isValid}>
              {t('initiatePay', 'Initiate Payment')}
            </Button>
          </section>
        </Form>
      </ModalBody>
    </div>
  );
};

export default InitiatePaymentDialog;
