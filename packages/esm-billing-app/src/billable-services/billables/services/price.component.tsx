import React, { useMemo } from 'react';
import { BillableFormSchema } from '../form-schemas';
import { Controller, useFormContext, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePaymentModes } from '../../../billing.resource';
import styles from './service-form.scss';
import { ComboBox, NumberInput, IconButton } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { ResponsiveWrapper } from '@openmrs/esm-framework';

interface PriceFieldProps {
  field: Record<string, any>;
  index: number;
  control: Control<BillableFormSchema>;
  removeServicePrice: (index: number) => void;
  errors: Record<string, any>;
}

const PriceField: React.FC<PriceFieldProps> = ({ field, index, control, removeServicePrice, errors }) => {
  const { t } = useTranslation();
  const { paymentModes, isLoading } = usePaymentModes();
  const { watch } = useFormContext();
  const servicePrices = watch('servicePrices');
  // Filter out the payment modes that are already selected
  const availablePaymentModes = useMemo(
    () =>
      paymentModes?.filter(
        (paymentMode) => !servicePrices?.some((servicePrice) => servicePrice.paymentMode?.uuid === paymentMode.uuid),
      ),
    [paymentModes, servicePrices],
  );

  return (
    <div key={field.id} className={styles.paymentMethods}>
      <ResponsiveWrapper>
        <Controller
          name={`servicePrices.${index}.paymentMode`}
          control={control}
          render={({ field }) => (
            <ComboBox
              onChange={({ selectedItem }) => field.onChange(selectedItem)}
              titleText={t('paymentMethodDescription', 'Payment method {{methodName}}', {
                methodName: servicePrices[index]?.paymentMode?.name ?? '',
              })}
              items={availablePaymentModes ?? []}
              itemToString={(item) => (item ? item.name : '')}
              placeholder={t('selectPaymentMode', 'Select payment mode')}
              disabled={isLoading}
              initialSelectedItem={field.value}
              invalid={!!errors?.servicePrices?.[index]?.paymentMode}
              invalidText={errors?.servicePrices?.[index]?.paymentMode?.message}
            />
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper>
        <Controller
          name={`servicePrices.${index}.price`}
          control={control}
          render={({ field }) => (
            <NumberInput
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
              type="number"
              labelText={t('price', 'Price')}
              placeholder={t('enterPrice', 'Enter price')}
              defaultValue={field.value}
              invalid={!!errors?.servicePrices?.[index]?.price}
              invalidText={errors?.servicePrices?.[index]?.price?.message}
            />
          )}
        />
      </ResponsiveWrapper>
      <IconButton
        kind="danger--tertiary"
        size="md"
        label={t('delete', 'Delete')}
        onClick={() => removeServicePrice(index)}>
        <TrashCan />
      </IconButton>
    </div>
  );
};

export default PriceField;
