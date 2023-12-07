import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TrashCan, Add } from '@carbon/react/icons';
import { Button, Dropdown, TextInput, NumberInputSkeleton } from '@carbon/react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import styles from './payment-form.scss';
import { usePaymentModes } from '../payment.resource';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { PaymentFormValue } from '../payments.component';

type PaymentFormProps = { disablePayment: boolean };

const DEFAULT_PAYMENT = { method: '', amount: 0, referenceCode: '' };

const PaymentForm: React.FC<PaymentFormProps> = ({ disablePayment }) => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext<PaymentFormValue>();
  const { paymentModes, isLoading, error } = usePaymentModes();
  const { fields, remove, append } = useFieldArray({ name: 'payment', control: control });

  const handleAppendPaymentMode = useCallback(() => append(DEFAULT_PAYMENT), [append]);
  const handleRemovePaymentMode = useCallback((index) => remove(index), [remove]);
  if (isLoading) {
    return <NumberInputSkeleton />;
  }
  if (error) {
    return (
      <div className={styles.errorPaymentContainer}>
        <ErrorState headerTitle={t('errorLoadingPaymentModes', 'Payment modes error')} error={error} />
      </div>
    );
  }

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id} className={styles.paymentMethodContainer}>
          <Controller
            control={control}
            name={`payment.${index}.method`}
            render={({ field }) => (
              <Dropdown
                light
                onChange={({ selectedItem }) => field.onChange(selectedItem.uuid)}
                titleText={t('paymentMethod', 'Payment method')}
                label={t('selectPaymentMethod', 'Select payment method')}
                items={paymentModes}
                itemToString={(item) => (item ? item.name : '')}
                invalid={!!errors?.payment?.[index]?.method}
                invalidText={errors?.payment?.[index]?.method?.message}
              />
            )}
          />
          <Controller
            control={control}
            name={`payment.${index}.amount`}
            render={({ field }) => (
              <TextInput
                invalid={!!errors?.payment?.[index]?.amount}
                invalidText={errors?.payment?.[index]?.amount?.message}
                light
                {...field}
                type="number"
                labelText={t('amount', 'Amount')}
              />
            )}
          />

          <Controller
            name={`payment.${index}.referenceCode`}
            control={control}
            render={({ field }) => (
              <TextInput light {...field} type="text" labelText={t('referenceNumber', 'Reference number')} />
            )}
          />

          <Button
            className={styles.removeButton}
            onClick={handleRemovePaymentMode}
            size="sm"
            renderIcon={(props) => <TrashCan size={24} {...props} />}
            kind="danger--tertiary"
            iconDescription="TrashCan">
            {t('delete', 'Delete')}
          </Button>
        </div>
      ))}
      <Button
        disabled={disablePayment}
        size="md"
        onClick={handleAppendPaymentMode}
        className={styles.paymentButtons}
        renderIcon={(props) => <Add size={24} {...props} />}
        iconDescription="Add">
        {t('addPaymentOptions', 'Add payment option')}
      </Button>
    </div>
  );
};

export default PaymentForm;
