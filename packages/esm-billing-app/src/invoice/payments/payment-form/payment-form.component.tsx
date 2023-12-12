import React, { useCallback } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TrashCan, Add } from '@carbon/react/icons';
import { Button, Dropdown, NumberInputSkeleton, TextInput } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { PaymentFormValue } from '../payments.component';
import { usePaymentModes } from '../payment.resource';
import styles from './payment-form.scss';

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
    <div className={styles.container}>
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
                {...field}
                invalid={!!errors?.payment?.[index]?.amount}
                invalidText={errors?.payment?.[index]?.amount?.message}
                labelText={t('amount', 'Amount')}
                light
                type="number"
              />
            )}
          />
          <Controller
            name={`payment.${index}.referenceCode`}
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                labelText={t('referenceNumber', 'Ref number')}
                light
                placeholder={t('enterReferenceNumber', 'Enter ref. number')}
                type="text"
              />
            )}
          />
          <div className={styles.removeButtonContainer}>
            <TrashCan onClick={handleRemovePaymentMode} className={styles.removeButton} size={20} />
          </div>
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
