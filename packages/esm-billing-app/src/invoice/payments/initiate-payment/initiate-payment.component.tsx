import {
  Button,
  Form,
  InlineNotification,
  Layer,
  Loading,
  ModalBody,
  ModalHeader,
  NumberInputSkeleton,
  TextInput,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConfig } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { BillingConfig } from '../../../config-schema';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { usePatientAttributes } from '../../../hooks/usePatientAttributes';
import { useRequestStatus } from '../../../hooks/useRequestStatus';
import { initiateStkPush } from '../../../m-pesa/mpesa-resource';
import { MappedBill } from '../../../types';
import { formatPhoneNumber } from '../utils';
import styles from './initiate-payment.scss';

const initiatePaymentSchema = z.object({
  phoneNumber: z
    .string()
    .nonempty({ message: 'Phone number is required' })
    .regex(/^\d{10}$/, { message: 'Phone number must be numeric and 10 digits' }),
  billAmount: z.string().nonempty({ message: 'Amount is required' }),
});

type FormData = z.infer<typeof initiatePaymentSchema>;

export interface InitiatePaymentDialogProps {
  closeModal: () => void;
  bill: MappedBill;
}

const InitiatePaymentDialog: React.FC<InitiatePaymentDialogProps> = ({ closeModal, bill }) => {
  const { t } = useTranslation();
  const { phoneNumber, isLoading: isLoadingPhoneNumber } = usePatientAttributes(bill.patientUuid);
  const { mpesaAPIBaseUrl } = useConfig<BillingConfig>();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [{ requestStatus }, pollingTrigger] = useRequestStatus(setNotification, closeModal, bill);

  const pendingAmount = bill.totalAmount - bill.tenderedAmount;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      billAmount: pendingAmount.toString(),
      phoneNumber: phoneNumber,
    },
    resolver: zodResolver(initiatePaymentSchema),
  });

  const watchedPhoneNumber = watch('phoneNumber');

  useEffect(() => {
    if (!watchedPhoneNumber && phoneNumber) {
      reset({ phoneNumber: watchedPhoneNumber });
    }
  }, [watchedPhoneNumber, setValue, phoneNumber, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const phoneNumber = formatPhoneNumber(data.phoneNumber);
    const amountBilled = data.billAmount;
    const accountReference = `${mflCodeValue}#${bill.receiptNumber}`;

    const payload = {
      AccountReference: accountReference,
      PhoneNumber: phoneNumber,
      Amount: amountBilled,
    };

    setIsLoading(true);
    const requestId = await initiateStkPush(payload, setNotification, mpesaAPIBaseUrl);
    pollingTrigger({ requestId, requestStatus: 'INITIATED', amount: amountBilled });
    setIsLoading(false);
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
          {isLoadingPhoneNumber ? (
            <NumberInputSkeleton className={styles.section} />
          ) : (
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
          )}
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
            <Button
              type="submit"
              className={styles.button}
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading || requestStatus === 'INITIATED'}>
              {isLoading ? (
                <>
                  <Loading className={styles.button_spinner} withOverlay={false} small />{' '}
                  {t('processingPayment', 'Processing Payment')}
                </>
              ) : (
                t('initiatePay', 'Initiate Payment')
              )}
            </Button>
          </section>
        </Form>
      </ModalBody>
    </div>
  );
};

export default InitiatePaymentDialog;
