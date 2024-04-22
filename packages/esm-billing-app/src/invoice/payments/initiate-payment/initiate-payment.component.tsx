/* eslint-disable no-console */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ModalBody, ModalHeader, TextInput, Layer } from '@carbon/react';
import styles from './initiate-payment.scss';
import { Controller, useForm, FieldError } from 'react-hook-form';
import { MappedBill } from '../../../types';
import { initiateStkPush } from '../payment.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import { formatPhoneNumber } from '../utils';
import { Buffer } from 'buffer';

export interface InitiatePaymentDialogProps {
  closeModal: () => void;
  bill: MappedBill;
}

const InitiatePaymentDialog: React.FC<InitiatePaymentDialogProps> = ({ closeModal, bill }) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    mode: 'all',
    defaultValues: {
      billAmount: bill.totalAmount,
    },
  });

  const onSubmit = async (data) => {
    try {
      const shortCode = '174379';
      const timeStamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, -3);
      const phoneNumber = formatPhoneNumber(data.phoneNumber);
      const amountBilled = data.billAmount;
      const passKey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
      const password = shortCode + passKey + timeStamp;
      const callBackUrl = 'https://76e3c9ac003fb3.lhr.life';
      const Password = Buffer.from(password).toString('base64');

      const payload = {
        BusinessShortCode: shortCode,
        Password: Password,
        Timestamp: timeStamp,
        TransactionType: 'CustomerPayBillOnline',
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: callBackUrl,
        AccountReference: 'MFLCode',
        TransactionDesc: 'HelloTest',
        Amount: amountBilled,
      };

      const resp = await initiateStkPush(payload);
      const response_data = await resp.json();
      console.log('[its-kios09]: STK PUSH response data: ', response_data);
      const CheckoutRequestID = response_data.CheckoutRequestID;
      console.log('CheckoutRequestID:', CheckoutRequestID);

      showSnackbar({
        title: t('stkPush', 'STK Push'),
        subtitle: t('stkPushSucess', 'STK Push send successfully'),
        kind: 'success',
        timeoutInMs: 3500,
        isLowContrast: true,
      });
      closeModal();
    } catch (err) {
      showSnackbar({
        title: t('stkPush', 'STK Push'),
        subtitle: t('stkPushError', 'STK Push request failed', { error: err.message }),
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
        <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <h4>{t('paymentPayment', 'Bill Payment')}</h4>
          <section className={styles.section}>
            <Controller
              control={control}
              name="phoneNumber"
              rules={{
                required: t('requiredField', 'This field is required'),
                minLength: {
                  value: 10,
                  message: t('invalidPhoneNumberLength', 'Phone number must be 10 digits long'),
                },
                maxLength: {
                  value: 10,
                  message: t('invalidPhoneNumberLength', 'Phone number must be 10 digits long'),
                },
                pattern: {
                  value: /^[0-9]*$/,
                  message: t('invalidPhoneNumber', 'Phone number must contain only digits'),
                },
              }}
              render={({ field }) => (
                <Layer>
                  <TextInput
                    {...field}
                    id="phoneNumber"
                    type="tel"
                    labelText={t('phoneNumber', 'Phone Number*')}
                    size="md"
                    placeholder={t('phoneNumber', 'Phone Number')}
                    invalid={!!errors.phoneNumber}
                    invalidText={errors?.phoneNumber?.message}
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
                    defaultValue={bill.totalAmount}
                  />
                </Layer>
              )}
            />
          </section>
          <section>
            <Button kind="secondary" className={styles.buttonLayout} onClick={closeModal}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button type="submit" className={styles.button}>
              {t('initiatePay', 'Initiate Payment')}
            </Button>
          </section>
        </Form>
      </ModalBody>
    </div>
  );
};

export default InitiatePaymentDialog;
