import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MappedBill } from '../../../types';
import styles from './payment.scss';
import { Stack, TextInput, Button, ButtonSet, InlineLoading, Dropdown } from '@carbon/react';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  showNotification,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import classNames from 'classnames';
import { Controller } from 'react-hook-form';
import { addPaymentToBill, usePaymentModes } from '../../../billing.resource';
import { usePaymentForm } from './use-payment-form';
import { z } from 'zod';
import { mutate } from 'swr';

type PaymentWorkspaceProps = DefaultWorkspaceProps & {
  bill: MappedBill;
};

const PaymentWorkspace: React.FC<PaymentWorkspaceProps> = ({
  bill,
  closeWorkspace,
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { formMethods, paymentSchema } = usePaymentForm(t, bill.balance);

  type PaymentFormData = z.infer<typeof paymentSchema>;

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();

  const {
    formState: { isSubmitting, errors },
    control,
    handleSubmit,
  } = formMethods;

  const onSubmit = async (data: PaymentFormData) => {
    const payment = {
      instanceType: data.instanceType?.uuid,
      amount: data.amountTendered,
      amountTendered: data.amountTendered,
      attributes: data.attributes
        ? Object.entries(data.attributes).map(([uuid, value]) => ({
            attributeType: {
              uuid,
            },
            value,
          }))
        : [],
    };

    try {
      const response = await addPaymentToBill(bill.uuid, payment);
      if (response.ok) {
        showSnackbar({
          title: t('paymentSaved', 'Payment saved'),
          kind: 'success',
          subtitle: t('paymentSavedSuccessfully', 'Payment saved successfully'),
        });
      }
      const url = `/ws/rest/v1/cashier/bill/${bill.uuid}`;
      mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
      closeWorkspaceWithSavedChanges();
    } catch (error) {
      showSnackbar({
        title: t('errorSavingPayment', 'Error saving payment'),
        kind: 'error',
        subtitle: error.message,
      });
    }
  };

  const handleError = (error: any) => {
    showSnackbar({
      title: t('errorSavingPayment', 'Error generating payment'),
      kind: 'error',
      subtitle: JSON.stringify(error, null, 2),
    });
  };

  useEffect(() => {
    promptBeforeClosing(() => formMethods.formState.isDirty);
  }, [formMethods.formState.isDirty, promptBeforeClosing]);

  if (isLoadingPaymentModes) {
    return <InlineLoading status="active" iconDescription="Loading payment modes" />;
  }

  const attributeTypes = (formMethods.watch('instanceType')?.attributeTypes as Array<Record<string, string>>) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit, handleError)} className={styles.form}>
      <div className={styles.formContainer}>
        <Stack className={styles.formStackControl} gap={7}>
          <ResponsiveWrapper>
            <Stack gap={4}>
              <Controller
                name="instanceType"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    id="instanceType"
                    titleText={t('instanceType', 'Instance Type')}
                    label={t('selectInstanceType', 'Select instance type')}
                    items={paymentModes}
                    onChange={({ selectedItem }) => field.onChange(selectedItem)}
                    itemToString={(item) => (item ? item.name : '')}
                    invalid={!!errors.instanceType}
                    invalidText={errors.instanceType?.message}
                  />
                )}
              />
            </Stack>
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <Controller
              name="amountTendered"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  id="amountTendered"
                  labelText={t('amountTendered', 'Amount Tendered')}
                  placeholder={t('enterAmountTendered', 'Enter amount tendered, max is {{max}}', {
                    max: bill.balance,
                  })}
                  type="number"
                  step="0.01"
                  max={bill.balance}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  invalid={!!errors.amountTendered}
                  invalidText={errors.amountTendered?.message}
                />
              )}
            />
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            {attributeTypes.map((attributeType) => (
              <Controller
                key={attributeType.uuid}
                name={`attributes.${attributeType.uuid}`}
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id={attributeType.uuid}
                    labelText={`${attributeType.name || 'Attribute'}${
                      attributeType.required ? t('required', ' (Required)') : ''
                    }`}
                    placeholder={attributeType.description || 'Enter value'}
                    invalid={!!errors.attributes?.[attributeType.uuid] || (attributeType.required && !field.value)}
                    invalidText={
                      errors.attributes?.[attributeType.uuid]?.message ||
                      (attributeType.required && !field.value
                        ? t('attributeValueRequired', 'Attribute value is required')
                        : '')
                    }
                  />
                )}
              />
            ))}
          </ResponsiveWrapper>
        </Stack>
      </div>
      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button style={{ maxWidth: '50%' }} kind="secondary" onClick={() => closeWorkspace()}>
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
  );
};

export default PaymentWorkspace;
