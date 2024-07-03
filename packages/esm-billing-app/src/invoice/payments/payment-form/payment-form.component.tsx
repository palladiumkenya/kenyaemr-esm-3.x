import React, { useCallback } from 'react';
import { Controller, FieldArrayWithId, UseFieldArrayRemove, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TrashCan, Add } from '@carbon/react/icons';
import { Button, Dropdown, NumberInputSkeleton, TextInput, NumberInput } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import styles from './payment-form.scss';
import { usePaymentModes } from '../../../billing.resource';
import { PaymentFormValue } from '../../../types';

type PaymentFormProps = {
  disablePayment: boolean;
  amountDue: number;
  append: (obj: { method: string; amount: number; referenceCode: string }) => void;
  fields: FieldArrayWithId<PaymentFormValue, 'payment', 'id'>[];
  remove: UseFieldArrayRemove;
};

const PaymentForm: React.FC<PaymentFormProps> = ({ disablePayment, amountDue, append, remove, fields }) => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
    setFocus,
  } = useFormContext<PaymentFormValue>();
  const { paymentModes, isLoading, error } = usePaymentModes();

  const handleAppendPaymentMode = useCallback(() => {
    {
      append({ method: '', amount: 0, referenceCode: '' });
      setFocus(`payment.${fields.length}.method`);
    }
  }, [append]);

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
                {...field}
                id="paymentMethod"
                onChange={({ selectedItem }) => {
                  setFocus(`payment.${index}.amount`);
                  field.onChange(selectedItem?.uuid);
                }}
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
              <NumberInput
                {...field}
                id="paymentAmount"
                onChange={(e) => field.onChange(Number(e.target.value))}
                invalid={!!errors?.payment?.[index]?.amount}
                invalidText={errors?.payment?.[index]?.amount?.message}
                label={t('amount', 'Amount')}
                placeholder={t('enterAmount', 'Enter amount')}
              />
            )}
          />
          <Controller
            name={`payment.${index}.referenceCode`}
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                id="paymentReferenceCode"
                labelText={t('referenceNumber', 'Reference number')}
                placeholder={t('enterReferenceNumber', 'Enter ref. number')}
                type="text"
              />
            )}
          />
          <div className={styles.removeButtonContainer}>
            <TrashCan onClick={() => handleRemovePaymentMode(index)} className={styles.removeButton} size={20} />
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
