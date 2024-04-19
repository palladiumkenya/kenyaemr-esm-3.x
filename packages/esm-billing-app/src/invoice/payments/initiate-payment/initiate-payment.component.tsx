import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ModalBody, ModalHeader, TextInput, Layer } from '@carbon/react';
import styles from './initiate-payment.scss';
import { Controller, useForm } from 'react-hook-form';
import { MappedBill } from '../../../types';
import { initiateStkPush } from '../payment.resource';
import { showSnackbar } from '@openmrs/esm-framework';

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
    defaultValues: {},
  });

  const onSubmit = (data) => {
    const payload = {
      phoneNumber: data.phoneNumber,
      amount: data.billAmount,
      billUuid: bill.uuid,
      referenceNumber: bill.receiptNumber,
      callBackUrl: 'https://756e-105-163-1-73.ngrok-free.app/api/confirmation-url/',
    };
    initiateStkPush(payload).then(
      (resp) => {
        showSnackbar({
          title: t('stkPush', 'STK Push'),
          subtitle: t('stkPushSucess', 'STK Push send successfully'),
          kind: 'success',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
      },
      (err) => {
        showSnackbar({
          title: t('stkPush', 'STK Push'),
          subtitle: t('stkPushError', 'STK Push request failed', { error: err.message }),
          kind: 'error',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
      },
    );
    closeModal();
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
                required: true,
                minLength: 10,
                maxLength: 10,
                pattern: /^[0-9]{10}$/,
              }}
              render={({ field }) => (
                <Layer>
                  <TextInput
                    {...field}
                    id="phoneNumber"
                    type="text"
                    labelText={t('phoneNumber', 'Phone Number*')}
                    size="md"
                    placeholder={t('phoneNumber', 'Phone Number')}
                    invalid={errors.phoneNumber ? true : false}
                  />
                  {errors.phoneNumber && errors.phoneNumber.type === 'required' && (
                    <p className={styles.errorMsg}>{t('requiredField', 'This field is required')}</p>
                  )}
                  {errors.phoneNumber && errors.phoneNumber.type === 'minLength' && (
                    <p className={styles.errorMsg}>
                      {t('invalidPhoneNumber', 'Phone number must be exactly 10 digits long')}
                    </p>
                  )}
                  {errors.phoneNumber && errors.phoneNumber.type === 'maxLength' && (
                    <p className={styles.errorMsg}>
                      {t('invalidPhoneNumber', 'Phone number must be exactly 10 digits long')}
                    </p>
                  )}
                  {errors.phoneNumber && errors.phoneNumber.type === 'pattern' && (
                    <p className={styles.errorMsg}>{t('invalidPhoneNumber', 'Phone number must numbers only')}</p>
                  )}
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
