import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, Control, useFormContext } from 'react-hook-form';
import { ResponsiveWrapper } from '@openmrs/esm-framework';
import { TextInput, Button, Dropdown, Toggle } from '@carbon/react';
import styles from './payment-mode-attributes.scss';
import { PAYMENT_MODE_ATTRIBUTE_FORMATS } from '../../constants';

type PaymentModeAttributeFields = {
  field: Record<string, any>;
  index: number;
  control: Control<Record<string, any>>;
  removeAttributeType: (index: number) => void;
  errors: Record<string, any>;
};

const PaymentModeAttributeFields: React.FC<PaymentModeAttributeFields> = ({
  field,
  index,
  control,
  removeAttributeType,
  errors,
}) => {
  const { t } = useTranslation();
  const { watch } = useFormContext();
  const retired = watch(`attributeTypes.${index}.retired`);

  return (
    <div className={styles.paymentModeAttributes}>
      <ResponsiveWrapper>
        <Controller
          control={control}
          name={`attributeTypes.${index}.name`}
          render={({ field }) => (
            <TextInput
              {...field}
              labelText={t('attributeName', 'Attribute name')}
              placeholder={t('enterAttributeName', 'Enter attribute name')}
              invalid={!!errors?.attributeTypes?.[index]?.name}
              invalidText={errors?.attributeTypes?.[index]?.name?.message}
              id={`attributeTypes.${index}.name`}
            />
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper>
        <Controller
          control={control}
          name={`attributeTypes.${index}.description`}
          render={({ field }) => (
            <TextInput
              {...field}
              labelText={t('attributeDescription', 'Attribute description')}
              placeholder={t('enterAttributeDescription', 'Enter attribute description')}
              invalid={!!errors?.attributeTypes?.[index]?.description}
              invalidText={errors?.attributeTypes?.[index]?.description?.message}
              id={`attributeTypes.${index}.description`}
            />
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper>
        <Controller
          control={control}
          name={`attributeTypes.${index}.retired`}
          render={({ field }) => (
            <Toggle
              {...field}
              labelText={t('attributeRetired', 'Attribute retired')}
              labelA="Off"
              labelB="On"
              toggled={field.value}
              id={`attributeTypes.${index}.retired`}
              onToggle={(value) => (value ? field.onChange(true) : field.onChange(false))}
            />
          )}
        />
      </ResponsiveWrapper>
      {retired && (
        <ResponsiveWrapper>
          <Controller
            control={control}
            name={`attributeTypes.${index}.retiredReason`}
            render={({ field }) => (
              <TextInput
                {...field}
                labelText={t('attributeRetiredReason', 'Attribute retired reason')}
                placeholder={t('enterAttributeRetiredReason', 'Enter attribute retired reason')}
                invalid={!!errors?.attributeTypes?.[index]?.retiredReason}
                invalidText={errors?.attributeTypes?.[index]?.retiredReason?.message}
              />
            )}
          />
        </ResponsiveWrapper>
      )}
      <ResponsiveWrapper>
        <Controller
          control={control}
          name={`attributeTypes.${index}.format`}
          render={({ field }) => (
            <Dropdown
              {...field}
              id={`attributeTypes.${index}.format`}
              titleText={t('attributeFormat', 'Attribute format')}
              placeholder={t('selectAttributeFormat', 'Select attribute format')}
              onChange={(event) => field.onChange(event.selectedItem)}
              initialSelectedItem={field.value}
              helperText={t('attributeFormatHelperText', 'The format of the attribute value e.g Free text, Number')}
              items={PAYMENT_MODE_ATTRIBUTE_FORMATS}
              invalid={!!errors?.attributeTypes?.[index]?.format}
              invalidText={errors?.attributeTypes?.[index]?.format?.message}
            />
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper>
        <Controller
          control={control}
          name={`attributeTypes.${index}.regExp`}
          render={({ field }) => (
            <TextInput
              {...field}
              labelText={t('regExp', 'Regular expression')}
              placeholder={t('enterRegExp', 'Enter regular expression')}
            />
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper>
        <Controller
          control={control}
          name={`attributeTypes.${index}.required`}
          render={({ field }) => (
            <Toggle
              {...field}
              labelText={t('attributeRequired', 'Attribute required')}
              labelA="Off"
              labelB="On"
              toggled={field.value}
              id={`attributeTypes.${index}.required`}
              onToggle={(value) => (value ? field.onChange(true) : field.onChange(false))}
            />
          )}
        />
      </ResponsiveWrapper>
      <Button size="sm" kind="danger--tertiary" onClick={() => removeAttributeType(index)}>
        {t('remove', 'Remove')}
      </Button>
    </div>
  );
};

export default PaymentModeAttributeFields;
