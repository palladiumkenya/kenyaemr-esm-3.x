import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import styles from './payment-mode.workspace.scss';
import { TextInput, ButtonSet, Button, InlineLoading, Stack } from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { createPaymentMode, handleMutation } from './payment-mode.resource';
import { PaymentMode } from '../types';

const paymentModeFormSchema = z.object({
  name: z
    .string({
      required_error: 'Payment mode name is required',
      invalid_type_error: 'Payment mode name is required',
    })
    .min(1, 'Payment mode name is required'),
  description: z
    .string({
      required_error: 'Payment mode description is required',
      invalid_type_error: 'Payment mode description is required',
    })
    .min(1, 'Payment mode description is required'),
});

type PaymentModeFormSchema = z.infer<typeof paymentModeFormSchema>;

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

  const formMethods = useForm<PaymentModeFormSchema>({
    resolver: zodResolver(paymentModeFormSchema),
    mode: 'all',
    defaultValues: Object.keys(initialPaymentMode).length > 0 ? initialPaymentMode : {},
  });

  const { errors, isSubmitting, isDirty } = formMethods.formState;

  const onSubmit = async (data: PaymentModeFormSchema) => {
    const payload = {
      name: data.name,
      description: data.description,
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

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => isDirty);
    }
  }, [isDirty, promptBeforeClosing]);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)} className={styles.form}>
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
                    invalid={!!errors.description}
                    invalidText={errors.description?.message}
                  />
                )}
              />
            </ResponsiveWrapper>
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
