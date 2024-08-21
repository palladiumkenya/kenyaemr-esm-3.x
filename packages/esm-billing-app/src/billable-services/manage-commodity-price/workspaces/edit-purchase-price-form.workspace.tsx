import React from 'react';
import { z } from 'zod';
import { mutate } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Button, ButtonSet, Form, NumberInput, InlineLoading } from '@carbon/react';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import isEqual from 'lodash-es/isEqual';

import styles from './edit-purchase-price.scss';
import classNames from 'classnames';
import { updateStockItemPurchasePrice } from '../../manage-commodity-price/stock-items.resource';

type FormData = {
  price: string;
};

const schema = z.object({
  price: z
    .string({ required_error: 'Price amount is required' })
    .refine((n) => parseInt(n) > 0, { message: 'Price should be greater than zero' }),
});

type EditPurchasePriceFormProps = DefaultWorkspaceProps & { stockItem: any };

export const EditPurchasePriceForm: React.FC<EditPurchasePriceFormProps> = ({ stockItem, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const defaultValues = { price: stockItem?.purchasePrice?.toString() };
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

  const inputDataAsObject = { price: inputPrice };
  const isUnchanged = isEqual(inputDataAsObject, defaultValues);

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    const updateBill = formData;
    formData['uuid'] = stockItem.uuid;
    formData['purchasePrice'] = formData.price;

    delete formData.price;
    stockItem.purchasePrice = formData.price;
    try {
      const response = await updateStockItemPurchasePrice(updateBill);
      if (response.ok) {
        showSnackbar({
          title: t('purchasePriceUpdate', 'Purchase Price Update'),
          subtitle: t('purchasePriceUpdateSuccess', 'Purchase Price update was successful'),
          kind: 'success',
          timeoutInMs: 5000,
        });
      }
    } catch (error) {
      showSnackbar({
        title: t('purchasePriceUpdate', 'Purchase Price Update'),
        subtitle: t('purchasePriceUpdateError', 'An error occurred while updating the purchase price'),
        kind: 'error',
        timeoutInMs: 5000,
      });
    } finally {
      mutate(
        (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/stockmanagement/stockitem`),
        undefined,
        {
          revalidate: true,
        },
      );
      closeWorkspace();
    }
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formContainer}>
        <div>
          <div>Stock Item Name</div>
          <div className={styles.itemValue}>{stockItem?.commonName}</div>
        </div>
        <div>
          <div>Stock Item Type</div>
          <div className={styles.itemValue}>{stockItem?.drugUuid ? 'Pharmaceutical' : 'Non-Pharmaceutical'}</div>
        </div>
        <div>
          <div>Dispensing Unit</div>
          <div className={styles.itemValue}>{stockItem?.dispensingUnitName ?? '--'}</div>
        </div>
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <ResponsiveWrapper>
              <NumberInput
                id="price"
                {...field}
                size="md"
                label={'Price'}
                placeholder={'price'}
                invalid={!!errors.price}
                invalidText={errors.price?.message}
                className={styles.formField}
                min={0}
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
          disabled={!isValid || isUnchanged || isSubmitting}
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
