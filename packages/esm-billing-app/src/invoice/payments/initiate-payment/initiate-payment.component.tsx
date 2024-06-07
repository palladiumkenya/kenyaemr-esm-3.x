/* eslint-disable no-console */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ModalBody, ModalHeader, TextInput, Layer } from '@carbon/react';
import styles from './initiate-payment.scss';
import { Controller, useForm } from 'react-hook-form';
import { MappedBill } from '../../../types';
import { initiateStkPush } from '../payment.resource';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { z } from 'zod';
import { formatPhoneNumber } from '../utils';
import { Buffer } from 'buffer';
import { useSystemSetting } from '../../../hooks/getMflCode';

const InitiatePaymentSchema = z.object({
  phoneNumber: z
    .string({
      required_error: 'Phone number is required',
      invalid_type_error: 'Phone number must be numeric and 10 digits',
    })
    .refine((value) => /^\d{10}$/.test(value), {
      message: 'Phone number must be 10 digits',
    }),
  billAmount: z.string({
    required_error: 'Amount is required',
  }),
});

export interface InitiatePaymentDialogProps {
  closeModal: () => void;
  bill: MappedBill;
}

const InitiatePaymentDialog: React.FC<InitiatePaymentDialogProps> = ({ closeModal, bill }) => {
  const { t } = useTranslation();
  const { mpesaCallbackUrl } = useConfig();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    mode: 'all',
    defaultValues: {
      billAmount: String(bill.totalAmount),
    },
  });

  const onSubmit = async (data) => {
    const validation = InitiatePaymentSchema.safeParse(data);
    if (validation.success === false) {
      const validationErrors = validation.error?.errors.map((error) => error.message);

      validationErrors.forEach((error) => {
        showSnackbar({
          title: t('InitiatePaymentError', 'Initiate Payment Error'),
          subtitle: error,
          kind: 'error',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
      });
    } else {
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
          TransactionDesc: 'HelloTest',
          Amount: amountBilled,
        };

        const resp = await initiateStkPush(payload);
        const response_data = await resp.data;
        console.log('[its-kios09]: STK PUSH response data: ', response_data);
        const CheckoutRequestID = response_data.CheckoutRequestID;
        console.log('CheckoutRequestID:', CheckoutRequestID);
        console.log('MFL code:', mflCodeValue);

        showSnackbar({
          title: t('stkPush', 'STK Push'),
          subtitle: t('stkPushSucess', 'STK Push send successfully'),
          kind: 'success',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
        closeModal();
      } catch (err) {
        console.error(err);
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
                    defaultValue={String(bill.totalAmount)}
                  />
                </Layer>
              )}
            />
          </section>
          <section>
            <Button kind="secondary" className={styles.buttonLayout} onClick={closeModal}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button type="submit" className={styles.button} onClick={handleSubmit(onSubmit)}>
              {t('initiatePay', 'Initiate Payment')}
            </Button>
          </section>
        </Form>
      </ModalBody>
    </div>
  );
};

export default InitiatePaymentDialog;
