import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import styles from './payment-mode.workspace.scss';
import { TextInput, ButtonSet, Button, InlineLoading, Stack, Toggle } from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { createPaymentMode, handleMutation } from './payment-mode.resource';
import { PaymentMode } from '../types';
import usePaymentModeFormSchema from './usePaymentModeFormSchema';
import PaymentModeAttributeFields from './payment-attributes/payment-mode-attributes.component';
import { Add } from '@carbon/react/icons';

type PaymentModeWorkspaceProps = DefaultWorkspaceProps & {
  initialPaymentMode?: PaymentMode;
};

const PaymentModeWorkspace: React.FC<PaymentModeWorkspaceProps> = ({
  closeWorkspace,
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
  initialPaymentMode = {} as PaymentMode,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { paymentModeFormSchema } = usePaymentModeFormSchema();
  type PaymentModeFormSchema = z.infer<typeof paymentModeFormSchema>;
  const formDefaultValues = Object.keys(initialPaymentMode).length > 0 ? initialPaymentMode : {};

  const formMethods = useForm<PaymentModeFormSchema>({
    resolver: zodResolver(paymentModeFormSchema),
    mode: 'all',
    defaultValues: formDefaultValues,
  });

  const { errors, isSubmitting, isDirty } = formMethods.formState;

  // field array
  const {
    fields: attributeTypeFields,
    append: appendAttributeType,
    remove: removeAttributeType,
  } = useFieldArray({
    control: formMethods.control,
    name: 'attributeTypes',
  });

  const mappedAttributeTypes = (attributes) => {
    return {
      name: attributes.name,
      description: attributes.description,
      retired: attributes.retired,
      attributeOrder: attributes?.attributeOrder ?? 0,
      format: attributes?.format ?? '',
      foreignKey: attributes?.foreignKey ?? null,
      regExp: attributes?.regExp ?? '',
      required: attributes.required,
    };
  };

  const onSubmit = async (data: PaymentModeFormSchema) => {
    const payload: Partial<PaymentMode> = {
      name: data.name,
      description: data.description,
      retired: data.retired,
      attributeTypes: data.attributeTypes.map(mappedAttributeTypes),
    };

    try {
      const response = await createPaymentMode(payload, initialPaymentMode?.uuid ?? '');
      if (response.ok) {
        showSnackbar({
          title: t('paymentModeCreated', 'Payment mode created successfully'),
          subtitle: t('paymentModeCreatedSubtitle', 'The payment mode has been created successfully'),
          kind: 'success',
          isLowContrast: true,
        });
        closeWorkspaceWithSavedChanges();
        handleMutation(`${restBaseUrl}/cashier/paymentMode?v=full`);
      }
    } catch (error) {
      const errorObject = error?.responseBody?.error;
      const errorMessage = errorObject?.message ?? 'An error occurred while creating the payment mode';
      showSnackbar({
        title: t('paymentModeCreationFailed', 'Payment mode creation failed'),
        subtitle: t(
          'paymentModeCreationFailedSubtitle',
          'An error occurred while creating the payment mode {{errorMessage}}',
          { errorMessage },
        ),
        kind: 'error',
        isLowContrast: true,
      });
    }
  };

  const handleError = (error) => {
    showSnackbar({
      title: t('paymentModeCreationFailed', 'Payment mode creation failed'),
      subtitle: t(
        'paymentModeCreationFailedSubtitle',
        'An error occurred while creating the payment mode {{errorMessage}}',
        { errorMessage: JSON.stringify(error, null, 2) },
      ),
      kind: 'error',
      isLowContrast: true,
    });
  };

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => isDirty);
    }
  }, [isDirty, promptBeforeClosing]);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit, handleError)} className={styles.form}>
        <div className={styles.formContainer}>
          <Stack className={styles.formStackControl} gap={7}>
            <ResponsiveWrapper>
              <Controller
                name="name"
                control={formMethods.control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="name"
                    type="text"
                    labelText={t('paymentModeName', 'Payment mode name')}
                    placeholder={t('paymentModeNamePlaceholder', 'Enter payment mode name')}
                    invalid={!!errors.name}
                    invalidText={errors.name?.message}
                  />
                )}
              />
            </ResponsiveWrapper>
            <ResponsiveWrapper>
              <Controller
                name="description"
                control={formMethods.control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="description"
                    type="text"
                    labelText={t('paymentModeDescription', 'Payment mode description')}
                    placeholder={t('paymentModeDescriptionPlaceholder', 'Enter payment mode description')}
                    invalid={!!errors.description}
                    invalidText={errors.description?.message}
                  />
                )}
              />
            </ResponsiveWrapper>
            <ResponsiveWrapper>
              <Controller
                name="retired"
                control={formMethods.control}
                render={({ field }) => (
                  <Toggle
                    {...field}
                    labelText={t('enablePaymentMode', 'Enable payment mode')}
                    labelA="Off"
                    labelB="On"
                    toggled={field.value}
                    id="retired"
                    onToggle={(value) => (value ? field.onChange(true) : field.onChange(false))}
                  />
                )}
              />
            </ResponsiveWrapper>
            <Button size="sm" kind="tertiary" renderIcon={Add} onClick={() => appendAttributeType({})}>
              {t('addAttributeType', 'Add attribute type')}
            </Button>
            {attributeTypeFields.map((field, index) => (
              <PaymentModeAttributeFields
                key={field.id}
                field={field}
                index={index}
                control={formMethods.control}
                removeAttributeType={removeAttributeType}
                errors={errors}
              />
            ))}
          </Stack>
        </div>
        <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
          <Button style={{ maxWidth: '50%' }} kind="secondary" onClick={closeWorkspace}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            disabled={isSubmitting || Object.keys(errors).length > 0}
            style={{ maxWidth: '50%' }}
            kind="primary"
            type="submit">
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

export default PaymentModeWorkspace;
