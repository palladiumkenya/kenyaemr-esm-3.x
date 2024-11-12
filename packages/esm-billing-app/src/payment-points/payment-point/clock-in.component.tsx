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
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PaymentPoint } from '../../types';
import { clockIn, clockOut, usePaymentPoints, useTimeSheets } from '../payment-points.resource';
import { useClockInStatus } from '../use-clock-in-status';

const schema = z.object({
  paymentPointUUID: z.string({ required_error: 'Payment point is required.' }),
});

type FormData = z.infer<typeof schema>;

type ClockInProps = {
  closeModal: () => void;
  paymentPoint?: PaymentPoint;
  onSuccess?: () => void;
};

export const ClockIn: React.FC<ClockInProps> = ({ closeModal, paymentPoint, onSuccess }) => {
  const { mutate } = useTimeSheets();
  const {
    currentProvider: { uuid: providerUUID },
  } = useSession();
  const { t } = useTranslation();
  const { paymentPoints, isLoading: isLoadingPaymentPoints } = usePaymentPoints();
  const { globalActiveSheet, isClockedInSomewhere } = useClockInStatus(paymentPoint?.uuid);

  const shouldPromptUser = !paymentPoint;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { paymentPointUUID: paymentPoint?.uuid ?? paymentPoints?.at(0)?.uuid },
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const clockInWrapper = (paymentPointUUID: string) => {
    clockIn({ cashier: providerUUID, cashPoint: paymentPointUUID, clockIn: new Date().toISOString() })
      .then(() => {
        showSnackbar({
          title: t('success', 'Success'),
          subtitle: t('successfullyClockedIn', `Successfully Clocked In `) + (paymentPoint?.name ?? ''),
          kind: 'success',
        });
        onSuccess?.();
        mutate();
        closeModal();
      })
      .catch(() => {
        showSnackbar({
          title: t('anErrorOccurred', 'An Error Occurred'),
          subtitle: t('anErrorOccurredClockingIn', `An error occurred clocking in `) + (paymentPoint?.name ?? ''),
          kind: 'error',
        });

        if (!shouldPromptUser) {
          closeModal();
        }
      });
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (isClockedInSomewhere) {
      clockOut(globalActiveSheet.uuid, {
        clockOut: new Date().toISOString(),
      })
        .then(() => {
          showSnackbar({
            title: t('success', 'Success'),
            subtitle:
              t('successfullyClockedOut', `Successfully Clocked Out Of `) + (globalActiveSheet.cashPoint.name ?? ''),
            kind: 'success',
          });
          onSuccess?.();
          mutate();
          clockInWrapper(data.paymentPointUUID);
        })
        .catch(() => {
          showSnackbar({
            title: t('anErrorOccurred', 'An Error Occurred'),
            subtitle:
              t('anErrorOccurredClockingOut', `An error occurred clocking out of `) + globalActiveSheet.cashPoint.name,
            kind: 'error',
          });
        })
        .finally(() => {
          closeModal();
        });

      return;
    }

    clockInWrapper(data.paymentPointUUID);
  };

  if (shouldPromptUser) {
    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader closeModal={undefined}>Clock In</ModalHeader>
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
          <Button kind="secondary" onClick={closeModal} type="button">
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={!isValid || isSubmitting}>
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
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ModalHeader closeModal={closeModal}>Clock In</ModalHeader>
      <ModalBody>
        {isClockedInSomewhere
          ? `You will be clocked in on ${paymentPoint.name} right now but you will be automatically be clocked out of ${globalActiveSheet.cashPoint.name} first. Do you want to proceed.`
          : `You will be clocked in on ${paymentPoint.name} right now. Do you want to proceed.`}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={!isValid || isSubmitting}>
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
