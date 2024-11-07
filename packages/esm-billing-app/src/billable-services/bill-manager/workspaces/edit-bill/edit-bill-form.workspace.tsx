import React, { useEffect } from 'react';
import { mutate } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  ComboBox,
  ButtonSet,
  Form,
  NumberInput,
  InlineLoading,
  InlineNotification,
  TextArea,
} from '@carbon/react';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';

import { LineItem, MappedBill } from '../../../../types';
import { processBillPayment } from '../../../../billing.resource';
import styles from './edit-bill.scss';
import { createEditBillPayload } from './edit-bill-util';
import classNames from 'classnames';
import {
  EditBillFormData,
  useDefaultEditBillFormValues,
  useEditBillFormSchema,
  useFormInitialValues,
} from './useEditBillFormSchema';

type EditBillFormProps = DefaultWorkspaceProps & { lineItem: LineItem; bill: MappedBill };

export const EditBillForm: React.FC<EditBillFormProps> = ({
  lineItem,
  closeWorkspace,
  bill,
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const editBillFormSchema = useEditBillFormSchema();
  const defaultValues = useDefaultEditBillFormValues(lineItem, bill);
  const { selectedServicePrice, isLoadingServices, selectedBillableService } = useFormInitialValues(lineItem);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, isDirty },
  } = useForm<EditBillFormData>({
    defaultValues,
    resolver: zodResolver(editBillFormSchema),
    mode: 'all',
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty]);

  const onSubmit: SubmitHandler<EditBillFormData> = async (formData) => {
    const updateBill = createEditBillPayload(lineItem, formData, bill, formData.adjustmentReason);
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
      closeWorkspaceWithSavedChanges();
    }
  };

  if (isLoadingServices) {
    return <InlineLoading description={t('loading', 'Loading')} />;
  }

  const formattedPrice = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
  }).format(lineItem.price);

  const subtitleText = `${t('currentPriceAndQuantity', 'Current price and quantity')}: ${t(
    'price',
    'Price',
  )}: ${formattedPrice} ${t('quantity', 'Quantity')}: ${lineItem.quantity}`;

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formContainer}>
        <InlineNotification
          title={lineItem.billableService?.split(':')[1]}
          subtitle={subtitleText}
          kind="info"
          lowContrast
          hideCloseButton
        />
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <ComboBox
                id={`${field.name}-${field.value}`}
                onChange={({ selectedItem }) => {
                  if (selectedItem) {
                    field.onChange(selectedItem?.price?.toString());
                  }
                }}
                titleText={t('priceOption', 'Price option')}
                items={selectedBillableService?.servicePrices ?? []}
                itemToString={(item) => `${item?.name} - (${item?.price})`}
                placeholder={t('selectPrice', 'Select price')}
                initialSelectedItem={selectedServicePrice}
                disabled={isLoadingServices}
                invalid={!!errors.price}
                invalidText={errors.price?.message}
              />
            )}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="quantity"
            render={({ field }) => (
              <NumberInput
                {...field}
                size="md"
                label={t('quantity', 'Quantity')}
                placeholder={t('pleaseEnterQuantity', 'Please enter Quantity')}
                invalid={!!errors.quantity}
                invalidText={errors.quantity?.message}
                className={styles.formField}
                min={1}
                value={field.value}
                id={`${field.name}-${field.value}`}
                hideSteppers
                disableWheel
              />
            )}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="adjustmentReason"
            render={({ field }) => (
              <TextArea
                {...field}
                labelText={t('adjustmentReason', 'Adjustment reason')}
                placeholder={t('pleaseEnterAdjustmentReason', 'Please enter adjustment reason')}
                invalid={!!errors.adjustmentReason}
                invalidText={errors.adjustmentReason?.message}
              />
            )}
          />
        </ResponsiveWrapper>
      </div>
      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={!isValid || !isDirty || isSubmitting} kind="primary" type="submit">
          {isSubmitting ? (
            <InlineLoading className={styles.spinner} description={t('updatingBill', 'Updating bill...')} />
          ) : (
            <span>{t('saveAndClose', 'Save & close')}</span>
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};
