import {
  Button,
  ButtonSet,
  ContentSwitcher,
  Form,
  InlineNotification,
  Layer,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInputSkeleton,
  Switch,
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
import { LineItem, MappedBill } from '../../../types';
import PaymentStatusCheckerModal from '../payment-status-ckecker.modal';
import { formatKenyanPhoneNumber } from '../utils';
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
  selectedLineItems: Array<LineItem>;
}

const InitiatePaymentDialog: React.FC<InitiatePaymentDialogProps> = ({ closeModal, bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const { phoneNumber, isLoading: isLoadingPhoneNumber } = usePatientAttributes(bill.patientUuid);
  const { mpesaAPIBaseUrl, isPDSLFacility } = useConfig<BillingConfig>();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMadePayment, setHasMadepayment] = useState(false);
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
    const phoneNumber = formatKenyanPhoneNumber(data.phoneNumber);
    const amountBilled = data.billAmount;
    const accountReference = `${mflCodeValue}#${bill.uuid}`;

    const payload = {
      AccountReference: accountReference,
      PhoneNumber: phoneNumber,
      Amount: amountBilled,
    };

    setIsLoading(true);
    const requestId = await initiateStkPush(payload, setNotification, mpesaAPIBaseUrl, isPDSLFacility);
    pollingTrigger({ requestId, requestStatus: 'INITIATED', amount: amountBilled });
    setIsLoading(false);
  };

  if (isPDSLFacility && hasMadePayment) {
    return (
      <PaymentStatusCheckerModal
        onClose={closeModal}
        paymentMade={hasMadePayment}
        onPaymentMadestatusChange={setHasMadepayment}
        bill={bill}
        selectedLineItems={selectedLineItems}
      />
    );
  }

  return (
    <Form>
      <ModalHeader className={styles.heading} closeModal={closeModal}>
        {t('paymentPayment', 'Bill Payment')}
      </ModalHeader>
      <ModalBody>
        {isPDSLFacility && (
          <ContentSwitcher
            size="md"
            selectedIndex={hasMadePayment ? 1 : 0}
            onChange={({ name }) => {
              setHasMadepayment(name === 'paymentMade');
            }}>
            <Switch name="paymentNotMade" text={t('paymentNotMade', 'Payment not made')} />
            <Switch name="paymentMade" text={t('paymentMade', 'Payments already made')} />
          </ContentSwitcher>
        )}
        <div className={styles.form}>
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
                      id="phoneNumber"
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
                    id="billAmount"
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
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={closeModal} className={styles.button}>
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
              t('initiatePayment', 'Initiate Payment')
            )}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </Form>
  );
};

export default InitiatePaymentDialog;
