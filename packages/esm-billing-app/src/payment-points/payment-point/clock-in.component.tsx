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
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PaymentPoint } from '../../types';
import { clockIn, usePaymentPoints, useProviderUUID, useTimeSheets } from '../payment-points.resource';

const schema = z.object({
  paymentPointUUID: z.string({ required_error: 'Payment point is required.' }),
});

type FormData = z.infer<typeof schema>;

export const ClockIn = ({ closeModal, paymentPoint }: { closeModal: () => void; paymentPoint?: PaymentPoint }) => {
  const { mutate } = useTimeSheets();
  const { providerUUID, isLoading, error } = useProviderUUID();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { paymentPoints, isLoading: isLoadingPaymentPoints } = usePaymentPoints();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: { paymentPointUUID: paymentPoint.uuid ?? paymentPoints.at(0).uuid },
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const onSubmit = () => {
    setIsSubmitting(true);
    clockIn({ cashier: providerUUID, cashPoint: paymentPoint.uuid, clockIn: new Date().toISOString() })
      .then(() => {
        showSnackbar({
          title: t('success', 'Success'),
          subtitle: t('successfullyClockedIn', 'Successfully Clocked In'),
          kind: 'success',
        });
        mutate();
      })
      .catch(() => {
        showSnackbar({
          title: t('anErrorOccurred', 'An Error Occurred'),
          subtitle: t('anErrorOccurredClockingIn', 'An error occurred clocking in'),
          kind: 'error',
        });
      })
      .finally(() => {
        setIsSubmitting(false);
        closeModal();
      });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader closeModal={closeModal}>Clock In</ModalHeader>
      <ModalBody>
        {paymentPoint ? (
          `You will be clocked in on ${paymentPoint.name} right now. Do you want to proceed.`
        ) : (
          <Controller
            control={control}
            name="paymentPointUUID"
            render={({ field }) => (
              <Select
                labelText={t('selectPaymentPoints', 'Select payment points')}
                helperText={t(
                  'selectPaymentPointsMessage',
                  'Select the payment point on which you will be clocked in.',
                )}
                {...field}
                label={t('quantity', 'Quantity')}
                placeholder={t('pleaseEnterQuantity', 'Please enter Quantity')}
                invalid={!!errors.paymentPointUUID}
                invalidText={errors.paymentPointUUID?.message}
                initialSelectedItem={field.value}>
                {isLoadingPaymentPoints ? (
                  <SelectSkeleton />
                ) : (
                  paymentPoints.map((point) => <SelectItem value={point.uuid} text={point.name} />)
                )}
              </Select>
            )}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={isLoading || error || !providerUUID || !isValid}>
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
