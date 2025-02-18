import { ComboBox, InlineLoading, RadioButton, RadioButtonGroup, TextInput } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import React, { useCallback, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePaymentModes } from '../../billing.resource';
import { BillingConfig } from '../../config-schema';
import { VisitAttributesFormValue } from '../check-in-form.utils';
import styles from './visit-attributes-form.scss';

type VisitAttributesFormProps = {
  setAttributes: (state) => void;
};

const VisitAttributesForm: React.FC<VisitAttributesFormProps> = ({ setAttributes }) => {
  const { t } = useTranslation();
  const { insuranceSchemes } = useConfig<BillingConfig>();
  const { visitAttributeTypes, patientExemptionCategories, insurancePaymentMethod } = useConfig<BillingConfig>();
  const { setValue, watch, control, getValues } = useFormContext<VisitAttributesFormValue>();
  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();
  const [isPatientExempted, paymentMethods] = watch(['isPatientExempted', 'paymentMethods']);
  const resetFormFieldsForNonExemptedPatients = useCallback(() => {
    setValue('insuranceScheme', '');
    setValue('policyNumber', '');
    setValue('exemptionCategory', '');
    setValue('paymentMethods', '');
  }, [setValue]);

  useEffect(() => {
    resetFormFieldsForNonExemptedPatients();
  }, [isPatientExempted, resetFormFieldsForNonExemptedPatients]);

  const createVisitAttributesPayload = useCallback(() => {
    const values = getValues();
    const formPayload = [
      { uuid: visitAttributeTypes.isPatientExempted, value: values.isPatientExempted },
      { uuid: visitAttributeTypes.paymentMethods, value: values.paymentMethods },
      { uuid: visitAttributeTypes.policyNumber, value: values.policyNumber },
      { uuid: visitAttributeTypes.insuranceScheme, value: values.insuranceScheme },
      { uuid: visitAttributeTypes.exemptionCategory, value: values.exemptionCategory },
    ];
    const visitAttributesPayload = formPayload.filter(
      (item) => item.value !== undefined && item.value !== null && item.value !== '',
    );
    return visitAttributesPayload.map(({ uuid, value }) => ({
      attributeType: uuid,
      value,
    }));
  }, [visitAttributeTypes, getValues]);

  const [policyNumber, exemptionCategory, insuranceScheme] = watch([
    'policyNumber',
    'exemptionCategory',
    'insuranceScheme',
  ]);

  useEffect(() => {
    setAttributes(createVisitAttributesPayload());
  }, [
    isPatientExempted,
    paymentMethods,
    setAttributes,
    createVisitAttributesPayload,
    policyNumber,
    exemptionCategory,
    insuranceScheme,
  ]);

  if (isLoadingPaymentModes) {
    return (
      <InlineLoading
        status="active"
        iconDescription={t('loadingDescription', 'Loading')}
        description={t('loading', 'Loading data...')}
      />
    );
  }

  return (
    <section>
      <div className={styles.sectionTitle}>{t('billing', 'Billing')}</div>
      <div className={styles.sectionField}>
        <div className={styles.sectionFieldLayer}>
          <Controller
            name="isPatientExempted"
            control={control}
            render={({ field }) => (
              <RadioButtonGroup
                onChange={(selected) => {
                  field.onChange(selected);
                }}
                orientation="horizontal"
                legendText={t('isPatientExemptedLegend', 'Is patient exempted from payment?')}
                name="patientExemption">
                <RadioButton labelText={t('yes', 'Yes')} value="true" id="Yes" />
                <RadioButton labelText={t('no', 'No')} value="false" id="No" />
              </RadioButtonGroup>
            )}
          />
        </div>

        {isPatientExempted === 'true' && (
          <div className={styles.sectionFieldLayer}>
            <Controller
              control={control}
              name="exemptionCategory"
              render={({ field }) => (
                <ComboBox
                  className={styles.sectionField}
                  onChange={({ selectedItem }) => field.onChange(selectedItem?.value)}
                  id="exemptionCategory"
                  items={patientExemptionCategories}
                  itemToString={(item) => (item ? item.label : '')}
                  titleText={t('exemptionCategory', 'Exemption category')}
                  placeholder={t('selectExemptionCategory', 'Select exemption category')}
                />
              )}
            />
          </div>
        )}

        {isPatientExempted === 'false' && (
          <div className={styles.sectionFieldLayer}>
            <Controller
              control={control}
              name="paymentMethods"
              render={({ field }) => (
                <ComboBox
                  className={styles.sectionField}
                  onChange={({ selectedItem }) => field.onChange(selectedItem)}
                  initialSelectedItem={field.value}
                  id="paymentMethods"
                  items={paymentModes?.map((method) => method.uuid)}
                  itemToString={(item) => paymentModes.find((mode) => mode.uuid === item)?.name ?? ''}
                  titleText={t('paymentMethodsTitle', 'Payment method')}
                  placeholder={t('selectPaymentMethod', 'Select payment method')}
                />
              )}
            />
          </div>
        )}

        {paymentMethods === insurancePaymentMethod && isPatientExempted === 'false' && (
          <>
            <div className={styles.sectionFieldLayer}>
              <Controller
                control={control}
                name="insuranceScheme"
                render={({ field }) => (
                  <ComboBox
                    className={styles.sectionField}
                    onChange={({ selectedItem }) => field.onChange(selectedItem)}
                    id="insurance-scheme"
                    items={insuranceSchemes}
                    itemToString={(item) => (item ? item : '')}
                    titleText={t('insuranceScheme', 'Insurance scheme')}
                    placeholder={t('selectInsuranceScheme', 'Select insurance scheme')}
                  />
                )}
              />
            </div>
            <div className={styles.sectionFieldLayer}>
              <Controller
                control={control}
                name="policyNumber"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    className={styles.sectionField}
                    onChange={(e) => field.onChange(e.target.value)}
                    id="policy-number"
                    type="text"
                    labelText={t('policyNumber', 'Policy number')}
                    placeholder={t('enterPolicyNumber', 'Enter policy number')}
                  />
                )}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default VisitAttributesForm;
