import { Button, Form, Loading, ModalBody, ModalFooter, ModalHeader, TextInput } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { showSnackbar, useSession } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import styles from './payment-points-styles.scss';
import { createPaymentPoint, usePaymentPoints } from './payment-points.resource';

const schema = z.object({
  cashPointName: z.string().nonempty({ message: 'Cash point name is required' }),
  description: z.string().nonempty({ message: 'Description is required' }),
});

type FormData = z.infer<typeof schema>;

export const CreatePaymentPoint = ({ closeModal }) => {
  const { t } = useTranslation();
  const { mutate } = usePaymentPoints();
  const { sessionLocation } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = ({ cashPointName, description }) => {
    setIsSubmitting(true);
    createPaymentPoint({ description, name: cashPointName, retired: false, location: sessionLocation.uuid })
      .then(() => {
        showSnackbar({
          title: t('success', 'Success'),
          subtitle: t('successfullyCreatedPaymentPoint', 'Successfully created payment point'),
          kind: 'success',
        });
        closeModal();
        mutate();
      })
      .catch(() => {
        showSnackbar({
          title: t('anErrorOccurred', 'An Error Occurred'),
          subtitle: t('anErrorOccurredCreatingPaymentPoint', 'An error occurred creating payment point'),
          kind: 'error',
        });
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Form>
      <ModalHeader closeModal={closeModal}>Create Payment Point</ModalHeader>
      <ModalBody>
        <Controller
          control={control}
          name="cashPointName"
          render={({ field }) => (
            <TextInput
              {...field}
              size="md"
              labelText={t('cashPointName', 'Cash Point Name')}
              invalid={!!errors.cashPointName}
              invalidText={errors.cashPointName?.message}
              className={styles.cashPoint}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextInput
              {...field}
              size="md"
              labelText={t('description', 'Description')}
              invalid={!!errors.description}
              invalidText={errors.description?.message}
            />
          )}
        />
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" className={styles.buttonLayout} onClick={closeModal} type="button">
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" className={styles.button} onClick={handleSubmit(onSubmit)} disabled={!isValid}>
          {isSubmitting ? (
            <>
              <Loading className={styles.button_spinner} withOverlay={false} small />
              {t('creating', 'Creating')}
            </>
          ) : (
            t('create', 'Create')
          )}
        </Button>
      </ModalFooter>
    </Form>
  );
};
