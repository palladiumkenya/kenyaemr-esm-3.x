import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Form, TextInput, NumberInput, Layer } from '@carbon/react';
import styles from './waive-bill-form.scss';
import { LineItem } from '../../../types';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import isEqual from 'lodash-es/isEqual';
import { DefaultWorkspaceProps } from '@openmrs/esm-framework';

type FormData = {
  price: string;
  quantity: string;
};

const schema = z.object({
  price: z
    .string({ required_error: 'Price amount is required' })
    .refine((n) => parseInt(n) > 0, { message: 'Price should be greater than zero' }),
  quantity: z
    .string({ required_error: 'Quantity amount is required' })
    .refine((n) => parseInt(n) > 0, { message: 'Quantity should be greater than zero' }),
});

export const EditBillForm: React.FC<DefaultWorkspaceProps & { lineItem: LineItem }> = ({
  lineItem,
  closeWorkspace,
}) => {
  const { t } = useTranslation();

  const defaultValues = { price: lineItem.price.toString(), quantity: lineItem.quantity.toString() };

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const inputPrice = watch('price');
  const inputQuantity = watch('quantity');

  const inputDataAsObject = { price: inputPrice, quantity: inputQuantity };
  const isUnchanged = isEqual(inputDataAsObject, defaultValues);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // TODO submit this data to the backend
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="price"
        render={({ field }) => (
          <Layer>
            <NumberInput
              {...field}
              size="md"
              label={'Price'}
              placeholder={'price'}
              invalid={!!errors.price}
              invalidText={errors.price?.message}
              className={styles.editFormInput}
              min={0}
              hideSteppers
              disableWheel
              helperText={'Enter the new price of the line item'}
            />
          </Layer>
        )}
      />
      <Controller
        control={control}
        name="quantity"
        render={({ field }) => (
          <Layer>
            <NumberInput
              {...field}
              size="md"
              label={'quantity'}
              placeholder={'quantity'}
              invalid={!!errors.quantity}
              invalidText={errors.quantity?.message}
              className={styles.editFormInput}
              min={1}
              helperText={'Enter the quantity of the line item'}
              id="quantity"
              hideSteppers
              disableWheel
            />
          </Layer>
        )}
      />
      <ButtonSet>
        <Button className={styles.button} kind="secondary" type={'button'} onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={!isValid || isUnchanged}>
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};
