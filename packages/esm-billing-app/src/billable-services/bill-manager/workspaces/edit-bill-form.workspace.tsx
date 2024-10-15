import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import { mutate } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Button, ComboBox, ButtonSet, Form, NumberInput, InlineLoading } from '@carbon/react';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import isEqual from 'lodash-es/isEqual';

import { LineItem, MappedBill } from '../../../types';
import { processBillPayment, usePaymentModes } from '../../../billing.resource';
import styles from './edit-bill.scss';
import { createEditBillPayload } from './edit-bill-util';
import classNames from 'classnames';
import { extractString } from '../../../helpers';
import PriceField from '../../billables/services/price.component';
import { useBillableServices } from '../../billable-service.resource';

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

type EditBillFormProps = DefaultWorkspaceProps & { lineItem: LineItem; bill: MappedBill };

export const EditBillForm: React.FC<EditBillFormProps> = ({ lineItem, closeWorkspace, bill }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const defaultValues = { price: lineItem.price.toString(), quantity: lineItem.quantity.toString() };
  const [selectedPrice, setSelectedPrice] = useState(lineItem.price.toString());
  const { billableServices, isLoading } = useBillableServices();
  const currentBillableService =
    billableServices.find((item) => item.uuid == lineItem.billableService?.split(':')[0]) || null;
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const inputPrice = watch('price');
  const inputQuantity = watch('quantity');

  const inputDataAsObject = { price: inputPrice, quantity: inputQuantity };
  const ischanged =
    !isEqual(inputDataAsObject.price, defaultValues.price) ||
    !isEqual(inputDataAsObject.quantity, defaultValues.quantity);

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    const updateBill = createEditBillPayload(lineItem, formData, bill);

    try {
      const response = await processBillPayment(updateBill, bill.uuid);
      if (response.ok) {
        showSnackbar({
          title: t('billUpdate', 'Bill update'),
          subtitle: t('billUpdateSuccess', 'Bill update was successful'),
          kind: 'success',
          timeoutInMs: 5000,
        });
      }
    } catch (error) {
      showSnackbar({
        title: t('billUpdate', 'Bill update'),
        subtitle: t('billUpdateError', 'An error occurred while updating the bill'),
        kind: 'error',
        timeoutInMs: 5000,
      });
    } finally {
      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/bill?status`), undefined, {
        revalidate: true,
      });
      closeWorkspace();
    }
  };
  // if (isLoading) {
  //   return <InlineLoading data-testid="loadingserviceprices" description={t('loading', 'Loading')} />;
  // }
  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formContainer}>
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <ComboBox
              onChange={({ selectedItem }) => {
                if (selectedItem) {
                  setSelectedPrice(selectedItem?.price?.toString());
                  field.onChange(selectedItem?.price?.toString());
                }
              }}
              titleText={t('paymentMethod', 'Payment method')}
              items={currentBillableService?.servicePrices ?? []}
              itemToString={(item) => (item?.name ? item.name + ' - (' + item.price + ')' : '')}
              placeholder={t('selectPaymentMode', 'Select payment mode')}
              disabled={isLoading}
              invalid={!!errors.price}
              invalidText={errors.price?.message}
            />
          )}
        />
        <ResponsiveWrapper>
          <NumberInput
            id="price"
            size="md"
            label={'Selected Price'}
            value={selectedPrice}
            placeholder={'New price'}
            className={styles.formField}
            min={0}
            readOnly
            hideSteppers
            disableWheel
          />
        </ResponsiveWrapper>
        <Controller
          control={control}
          name="quantity"
          render={({ field }) => (
            <ResponsiveWrapper>
              <NumberInput
                {...field}
                size="md"
                label={t('quantity', 'Quantity')}
                placeholder={t('pleaseEnterQuantity', 'Please enter Quantity')}
                invalid={!!errors.quantity}
                invalidText={errors.quantity?.message}
                className={styles.formField}
                min={1}
                initialSelectedItem={field.value}
                id="quantity"
                hideSteppers
                disableWheel
              />
            </ResponsiveWrapper>
          )}
        />
      </div>
      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          className={styles.button}
          disabled={!isValid || !ischanged || isSubmitting}
          kind="primary"
          type="submit">
          {isSubmitting ? (
            <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
          ) : (
            <span>{t('saveAndClose', 'Save & close')}</span>
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};
