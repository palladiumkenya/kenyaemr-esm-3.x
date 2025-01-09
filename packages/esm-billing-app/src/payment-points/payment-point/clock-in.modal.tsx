import {
  Button,
  Form,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  SelectSkeleton,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { showSnackbar, useSession } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PaymentPoint } from '../../types';
import { clockIn, clockOut, useActiveSheet, usePaymentPoints } from '../payment-points.resource';
import { useClockInStatus } from '../use-clock-in-status';
import styles from './clock-in.scss';

const schema = z.object({
  paymentPointUUID: z.string({ required_error: 'Payment point is required.' }),
});

type FormData = z.infer<typeof schema>;

export const ClockIn = ({
  closeModal,
  paymentPoint,
  disableCancelling,
}: {
  closeModal?: () => void;
  paymentPoint?: PaymentPoint;
  disableCancelling?: boolean;
}) => {
  const { mutate } = useActiveSheet();
  const { currentProvider } = useSession();
  const providerUUID = currentProvider?.uuid;

  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { paymentPoints, isLoading: isLoadingPaymentPoints } = usePaymentPoints();
  const { globalActiveSheet, isClockedIn } = useClockInStatus();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: { paymentPointUUID: paymentPoint?.uuid ?? paymentPoints?.at(0)?.uuid },
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const clockInWrapper = (paymentPointUUID: string) => {
    const selectedPaymentPoint = paymentPoints.find((point) => point.uuid === paymentPointUUID);
    clockIn({ cashier: providerUUID, cashPoint: paymentPointUUID, clockIn: new Date().toISOString() })
      .then(() => {
        showSnackbar({
          title: t('success', 'Success'),
          subtitle: t('successfullyClockedIn', `Successfully Clocked In ${selectedPaymentPoint.name}`),
          kind: 'success',
        });
        mutate();
        closeModal();
      })
      .catch(() => {
        showSnackbar({
          title: t('anErrorOccurred', 'An Error Occurred'),
          subtitle: t('anErrorOccurredClockingIn', `An error occurred clocking in ${selectedPaymentPoint.name}`),
          kind: 'error',
        });

        if (disableCancelling !== true) {
          closeModal();
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    setIsSubmitting(true);
    if (isClockedIn) {
      clockOut(globalActiveSheet.uuid, {
        clockOut: new Date().toISOString(),
      })
        .then(() => {
          showSnackbar({
            title: t('success', 'Success'),
            subtitle: t('successfullyClockedOut', `Successfully Clocked Out Of ${globalActiveSheet.cashPoint.name}`),
            kind: 'success',
          });
          mutate();
          clockInWrapper(data.paymentPointUUID);
        })
        .catch(() =>
          showSnackbar({
            title: t('anErrorOccurred', 'An Error Occurred'),
            subtitle: t(
              'anErrorOccurredClockingOut',
              `An error occurred clocking out of ${globalActiveSheet.cashPoint.name}`,
            ),
            kind: 'error',
          }),
        )
        .finally(() => {
          setIsSubmitting(false);
          closeModal();
        });

      return;
    }

    clockInWrapper(data.paymentPointUUID);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <ModalHeader closeModal={disableCancelling ? undefined : closeModal}>Clock In</ModalHeader>
      <ModalBody>
        {isLoadingPaymentPoints ? (
          <SelectSkeleton />
        ) : (
          <Select
            {...register('paymentPointUUID')}
            labelText={t('selectPaymentPoint', 'Select payment point')}
            helperText={t('selectPaymentPointMessage', 'Select the payment point on which you will be clocked in.')}
            label={t('paymentPoint', 'Payment point')}
            placeholder={t('pleaseSelectPaymentPoint', 'Please select a payment point')}
            invalid={!!errors.paymentPointUUID}
            invalidText={errors.paymentPointUUID?.message}>
            {paymentPoints.map((point) => (
              <SelectItem value={point.uuid} text={point.name} />
            ))}
          </Select>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          kind="secondary"
          onClick={disableCancelling ? undefined : closeModal}
          type="button"
          disabled={Boolean(disableCancelling)}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={!isValid || !providerUUID}>
          {isSubmitting ? (
            <>
              <Loading withOverlay={false} small />
              {t('clockingIn', 'Clocking in')}
            </>
          ) : (
            t('clockIn', 'Clock In')
          )}
        </Button>
      </ModalFooter>
    </Form>
  );
};
