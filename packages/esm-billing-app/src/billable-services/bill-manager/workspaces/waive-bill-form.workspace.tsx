import React, { ChangeEvent, useState } from 'react';
import { Form, Stack, FormGroup, Layer, Button, NumberInput } from '@carbon/react';
import { TaskAdd } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './waive-bill-form.scss';
import { MappedBill } from '../../../types';
import { createBillWaiverPayload, extractErrorMessagesFromResponse } from '../../../utils';
import { convertToCurrency, extractString } from '../../../helpers';
import { processBillPayment, usePaymentModes } from '../../../billing.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

type BillWaiverFormProps = {
  bill: MappedBill;
};

type FormData = {
  waiveAmount: string;
};

export const WaiveBillForm: React.FC<BillWaiverFormProps> = ({ bill }) => {
  const { lineItems } = bill;

  const { t } = useTranslation();

  const totalAmount = lineItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const { paymentModes } = usePaymentModes(false);

  const schema = z.object({
    waiveAmount: z
      .string({ required_error: 'Waive amount is required' })
      .refine((n) => parseInt(n) > 0, { message: 'Amount to waive should be greater than zero' })
      .refine((n) => parseInt(n) < totalAmount + 1, { message: 'Amount to waive cannot be greater than total amount' }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'all',
    resolver: zodResolver(schema),
  });

  if (lineItems?.length === 0) {
    return null;
  }

  const onSubmit: SubmitHandler<FormData> = ({ waiveAmount }) => {
    const waiverEndPointPayload = createBillWaiverPayload(
      bill,
      parseInt(waiveAmount),
      totalAmount,
      lineItems,
      paymentModes,
    );

    processBillPayment(waiverEndPointPayload, bill.uuid).then(
      (resp) => {
        showSnackbar({
          title: t('billWaiver', 'Bill waiver'),
          subtitle: t('billWaiverSuccess', 'Bill waiver successful'),
          kind: 'success',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
        mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/cashier/bill?v=full'), undefined, {
          revalidate: true,
        });
      },
      (error) => {
        showSnackbar({
          title: t('billWaiver', 'Bill waiver'),
          subtitle: t('billWaiverError', 'Bill waiver failed {{error}}', {
            error: extractErrorMessagesFromResponse(error?.responseBody),
          }),
          kind: 'error',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
      },
    );
  };

  return (
    <Form className={styles.form} aria-label={t('waiverForm', 'Waiver form')} onSubmit={handleSubmit(onSubmit)}>
      <span className={styles.formTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={7}>
        <FormGroup>
          <section className={styles.billWaiverDescription}>
            <label className={styles.label}>{t('billItems', 'Bill Items')}</label>
            <p className={styles.value}>
              {t('billName', ' {{billName}} ', {
                billName: lineItems.map((item) => extractString(item.item || item.billableService)).join(', ') ?? '--',
              })}
            </p>
          </section>
          <section className={styles.billWaiverDescription}>
            <label className={styles.label}>{t('billTotal', 'Bill total')}</label>
            <p className={styles.value}>{convertToCurrency(totalAmount)}</p>
          </section>
          <Controller
            control={control}
            name="waiveAmount"
            render={({ field }) => (
              <Layer className={styles.formControlLayer}>
                <NumberInput
                  id="waiverAmount"
                  label={t('amountToWaiveLabel', 'Amount to Waive')}
                  helperText={t('amountToWaiveHelper', 'Specify the amount to be deducted from the bill')}
                  aria-label={t('amountToWaiveAriaLabel', 'Enter amount to waive')}
                  hideSteppers
                  disableWheel
                  min={0}
                  max={totalAmount}
                  {...field}
                  invalidText={errors.waiveAmount?.message || 'Invalid'}
                  invalid={!!errors.waiveAmount}
                />
              </Layer>
            )}
          />
        </FormGroup>
        <div className={styles.buttonContainer}>
          <Button kind="tertiary" renderIcon={TaskAdd} disabled={!isValid}>
            {t('postWaiver', 'Post waiver')}
          </Button>
        </div>
      </Stack>
    </Form>
  );
};
