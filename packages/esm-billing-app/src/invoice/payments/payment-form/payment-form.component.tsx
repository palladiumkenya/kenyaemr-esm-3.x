import React, { useCallback } from 'react';
import { Controller, FieldArrayWithId, UseFieldArrayRemove, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TrashCan, Add } from '@carbon/react/icons';
import { Button, Dropdown, NumberInputSkeleton, TextInput, NumberInput } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import styles from './payment-form.scss';
import { usePaymentModes } from '../../../billing.resource';
import { type LineItem, PaymentFormValue, PaymentMethod } from '../../../types';
import { extractBillableName } from '../../../utils';

type PaymentFormProps = {
  disablePayment: boolean;
  amountDue: number;
  append: (obj: { method: PaymentMethod; amount: number; referenceCode: string; itemUuid: string }) => void;
  fields: FieldArrayWithId<PaymentFormValue, 'payment', 'id'>[];
  remove: UseFieldArrayRemove;
  selectedLineItems: Array<LineItem>;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  disablePayment,
  amountDue,
  append,
  remove,
  fields,
  selectedLineItems,
}) => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
    setFocus,
    getValues,
    watch,
  } = useFormContext<PaymentFormValue>();
  const { paymentModes, isLoading, error } = usePaymentModes();

  const paymentValues = watch('payment');

  const getUsedItemUuids = (currentIndex: number) => {
    return paymentValues.map((payment, index) => (index !== currentIndex ? payment?.itemUuid : null)).filter(Boolean);
  };

  const getAvailableLineItems = (currentIndex: number) => {
    const usedUuids = getUsedItemUuids(currentIndex);
    return selectedLineItems.filter((item) => item.paymentStatus === 'PENDING' && !usedUuids.includes(item.uuid));
  };

  const shouldShowReferenceCode = (index: number) => {
    const formValues = getValues();
    const attributes = formValues?.payment?.[index]?.method?.attributeTypes ?? [];
    return attributes.some((attribute) => attribute.required) || attributes?.length > 0;
  };

  const handleAppendPaymentMode = useCallback(() => {
    const availableItems = getAvailableLineItems(fields.length);
    const initialItemUuid = availableItems.length === 1 ? availableItems[0].uuid : '';

    append({
      method: null,
      amount: null,
      referenceCode: '',
      itemUuid: initialItemUuid,
    });

    setFocus(`payment.${fields.length}.method`);
  }, [append, fields.length, setFocus, selectedLineItems]);

  const handleRemovePaymentMode = useCallback((index) => remove(index), [remove]);

  if (fields.length === 0 && selectedLineItems.length === 1) {
    handleAppendPaymentMode();
  }

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
      {fields.map((field, index) => {
        const availableLineItems = getAvailableLineItems(index);
        return (
          <div key={field.id} className={styles.paymentMethodContainer}>
            <Controller
              control={control}
              name={`payment.${index}.itemUuid`}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  id="paymentLineItem"
                  onChange={({ selectedItem }) => {
                    field.onChange(selectedItem?.uuid);
                    setFocus(`payment.${index}.method`);
                  }}
                  titleText={t('selectLineItemToPay', 'Select line item to pay')}
                  label={t('selectLineItemToPay', 'Select line item to pay')}
                  items={availableLineItems}
                  itemToString={(item) => extractBillableName(item)}
                  invalid={!!errors?.payment?.[index]?.itemUuid}
                  invalidText={errors?.payment?.[index]?.itemUuid?.message}
                />
              )}
            />
            <Controller
              control={control}
              name={`payment.${index}.method`}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  id="paymentMethod"
                  onChange={({ selectedItem }) => {
                    setFocus(`payment.${index}.amount`);
                    field.onChange(selectedItem);
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

            {shouldShowReferenceCode(index) && (
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
                    invalid={!!errors?.payment?.[index]?.referenceCode}
                    invalidText={errors?.payment?.[index]?.referenceCode?.message}
                  />
                )}
              />
            )}
            <div className={styles.removeButtonContainer}>
              <TrashCan onClick={() => handleRemovePaymentMode(index)} className={styles.removeButton} size={20} />
            </div>
          </div>
        );
      })}
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
