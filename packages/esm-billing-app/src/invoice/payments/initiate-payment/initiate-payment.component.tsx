import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ModalBody, ModalHeader, TextInput, Layer, InlineNotification, Loading } from '@carbon/react';
import styles from './initiate-payment.scss';
import { Controller, useForm } from 'react-hook-form';
import { MappedBill } from '../../../types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatPhoneNumber } from '../utils';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { RequestStatus, getRequestStatus, initiateStkPush, readableStatusMap } from '../../../m-pesa/mpesa-resource';
import { getErrorMessage } from '../../../helpers';

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
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [requestData, setRequestData] = useState<{ requestId: string; requestStatus: RequestStatus | null }>({
    requestId: null,
    requestStatus: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (requestData.requestId && !['COMPLETE', 'FAILED', 'NOT-FOUND'].includes(requestData.requestStatus)) {
      const fetchStatus = async () => {
        try {
          const status = await getRequestStatus(requestData.requestId);
          if (status === 'COMPLETE' || status === 'FAILED' || status === 'NOT-FOUND') {
            clearInterval(interval);
          }
          if (status === 'COMPLETE' || status === 'INITIATED') {
            setNotification({ type: 'success', message: readableStatusMap.get(status) });
          }
          if (status === 'FAILED' || status === 'NOT-FOUND') {
            setNotification({ type: 'error', message: readableStatusMap.get(status) });
          }
        } catch (error) {
          clearInterval(interval);
          setNotification({ type: 'error', message: getErrorMessage(error) });
        }
      };

      interval = setInterval(fetchStatus, 2000);

      return () => clearInterval(interval);
    }
  }, [requestData.requestId, requestData.requestStatus]);

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

  const onSubmit = async (data: { phoneNumber: any; billAmount: any }) => {
    const phoneNumber = formatPhoneNumber(data.phoneNumber);
    const amountBilled = data.billAmount;
    const accountReference = `${mflCodeValue}#${bill.receiptNumber}`;

    const payload = {
      AccountReference: accountReference,
      PhoneNumber: phoneNumber,
      Amount: amountBilled,
    };

    setIsLoading(true);
    const requestId = await initiateStkPush(payload, setNotification);
    setIsLoading(false);
    setRequestData({ requestId, requestStatus: 'INITIATED' });
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} />
      <ModalBody>
        <Form className={styles.form}>
          <h4>{t('paymentPayment', 'Bill Payment')}</h4>
          {notification && (
            <InlineNotification
              kind={notification.type}
              title={notification.message}
              onCloseButtonClick={() => setNotification(null)}
            />
          )}
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
              {isLoading && <Loading className="button-spinner" withOverlay={false} small />}
              {t('initiatePay', 'Initiate Payment')}
            </Button>
          </section>
        </Form>
      </ModalBody>
    </div>
  );
};

export default InitiatePaymentDialog;
