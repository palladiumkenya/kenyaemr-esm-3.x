import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonSet, Button, Stack, Toggle, InlineNotification, InlineLoading } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';

import { useLayoutType, ResponsiveWrapper, showSnackbar, restBaseUrl } from '@openmrs/esm-framework';
import { DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import styles from './commodity-form.scss';
import StockItemSearch from './stock-search.component';
import classNames from 'classnames';
import { zodResolver } from '@hookform/resolvers/zod';
import PriceField from '../services/price.component';
import { billableFormSchema, BillableFormSchema } from '../form-schemas';
import { formatBillableServicePayloadForSubmission, mapInputToPayloadSchema } from '../form-helper';
import { createBillableService } from '../../billable-service.resource';
import { handleMutate } from '../../utils';

type CommodityFormProps = DefaultPatientWorkspaceProps & {
  initialValues?: BillableFormSchema;
};

const CommodityForm: React.FC<CommodityFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  initialValues,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const formMethods = useForm<BillableFormSchema>({
    resolver: zodResolver(billableFormSchema),
    defaultValues: initialValues
      ? mapInputToPayloadSchema(initialValues)
      : { servicePrices: [], serviceStatus: 'ENABLED' },
  });

  const {
    setValue,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isDirty, isSubmitting },
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'servicePrices',
  });

  useEffect(() => {
    if (initialValues) {
      trigger();
    }
  }, [initialValues, trigger]);

  const onSubmit = async (formValues: BillableFormSchema) => {
    const payload = formatBillableServicePayloadForSubmission(formValues, initialValues?.['uuid']);
    try {
      const response = await createBillableService(payload);
      if (response.ok) {
        showSnackbar({
          title: t('commodityBillableCreated', 'Commodity price created successfully'),
          subtitle: t('commodityBillableCreatedSubtitle', 'The commodity price has been created successfully'),
          kind: 'success',
          isLowContrast: true,
          timeoutInMs: 5000,
        });
        handleMutate(`${restBaseUrl}/cashier/billableService?v`);
        closeWorkspaceWithSavedChanges();
      }
    } catch (e) {
      showSnackbar({
        title: t('commodityBillableCreationFailed', 'Commodity price creation failed'),
        subtitle: t('commodityBillableCreationFailedSubtitle', 'The commodity price creation failed'),
        kind: 'error',
        isLowContrast: true,
        timeoutInMs: 5000,
      });
    }
  };

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const renderServicePriceFields = useMemo(
    () =>
      fields.map((field, index) => (
        <PriceField
          key={field.id}
          field={field}
          index={index}
          control={control}
          removeServicePrice={remove}
          errors={errors}
        />
      )),
    [fields, control, remove, errors],
  );

  const handleError = (err) => {
    console.error(JSON.stringify(err, null, 2));
    showSnackbar({
      title: t('commodityBillableCreationFailed', 'Commodity price creation failed'),
      subtitle: t(
        'commodityBillableCreationFailedSubtitle',
        'The commodity price creation failed, view browser console for more details',
      ),
      kind: 'error',
      isLowContrast: true,
      timeoutInMs: 5000,
    });
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit, handleError)} className={styles.form}>
        <div className={styles.formContainer}>
          <Stack className={styles.formStackControl} gap={7}>
            <StockItemSearch setValue={setValue} defaultStockItem={initialValues?.name} />
            {errors.concept && (
              <InlineNotification
                kind="error"
                lowContrast={true}
                title={t('conceptMissing', 'Concept missing for {{name}}', { name: initialValues?.name })}
                subtitle={t('conceptMissingSubtitle', 'Please delete the current item and re-create the charge item')}
              />
            )}
            <ResponsiveWrapper>
              <Controller
                control={control}
                name="serviceStatus"
                render={({ field }) => (
                  <Toggle
                    labelText={t('status', 'Status')}
                    labelA="Off"
                    labelB="On"
                    defaultToggled={field.value === 'ENABLED'}
                    id="serviceStatus"
                    onToggle={(value) => (value ? field.onChange('ENABLED') : field.onChange('DISABLED'))}
                  />
                )}
              />
            </ResponsiveWrapper>
            {renderServicePriceFields}
            <Button size="sm" kind="tertiary" renderIcon={Add} onClick={() => append({})}>
              {t('addPaymentMethod', 'Add payment method')}
            </Button>
            {!!errors.servicePrices && (
              <InlineNotification
                aria-label="closes notification"
                kind="error"
                lowContrast={true}
                statusIconDescription="notification"
                title={t('paymentMethodRequired', 'Payment method required')}
                subTitle={t('atLeastOnePriceRequired', 'At least one price is required')}
              />
            )}
          </Stack>
        </div>
        <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
          <Button style={{ maxWidth: '50%' }} kind="secondary" onClick={closeWorkspace}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={isSubmitting || !isDirty} style={{ maxWidth: '50%' }} kind="primary" type="submit">
            {isSubmitting ? (
              <span style={{ display: 'flex', justifyItems: 'center' }}>
                {t('submitting', 'Submitting...')} <InlineLoading status="active" iconDescription="Loading" />
              </span>
            ) : (
              t('saveAndClose', 'Save & close')
            )}
          </Button>
        </ButtonSet>
      </form>
    </FormProvider>
  );
};

export default CommodityForm;
