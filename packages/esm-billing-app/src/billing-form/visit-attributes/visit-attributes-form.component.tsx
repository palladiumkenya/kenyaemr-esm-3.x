import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, InlineLoading, ComboBox, RadioButtonGroup, RadioButton } from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../../config-schema';
import { usePaymentModes } from '../../billing.resource';
import styles from './visit-attributes-form.scss';

type VisitAttributesFormProps = {
  setAttributes: (state) => void;
  setPaymentMethod?: (value: any) => void;
};

type VisitAttributesFormValue = {
  isPatientExempted: string;
  paymentMethods: { uuid: string; name: string } | null;
  insuranceScheme: string;
  policyNumber: string;
  exemptionCategory: string;
};

const visitAttributesFormSchema = z.object({
  isPatientExempted: z.string(),
  paymentMethods: z.object({ uuid: z.string(), name: z.string() }).nullable(),
  insuranceScheme: z.string().optional(),
  policyNumber: z.string().optional(),
  exemptionCategory: z.string().optional(),
});

const VisitAttributesForm: React.FC<VisitAttributesFormProps> = ({ setAttributes, setPaymentMethod }) => {
  const { t } = useTranslation();
  const { visitAttributeTypes, patientExemptionCategories } = useConfig<BillingConfig>();
  const { control, getValues, watch, setValue } = useForm<VisitAttributesFormValue>({
    mode: 'all',
    defaultValues: {
      isPatientExempted: '',
      paymentMethods: null,
      insuranceScheme: '',
      policyNumber: '',
      exemptionCategory: '',
    },
    resolver: zodResolver(visitAttributesFormSchema),
  });

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();
  const [isPatientExempted, paymentMethods] = watch(['isPatientExempted', 'paymentMethods']);

  const resetFormFieldsForNonExemptedPatients = useCallback(() => {
    setValue('insuranceScheme', '');
    setValue('policyNumber', '');
    setValue('exemptionCategory', '');
    setValue('paymentMethods', null);
  }, [setValue]);

  useEffect(() => {
    if (isPatientExempted === 'true') {
      resetFormFieldsForNonExemptedPatients();
    }
  }, [isPatientExempted, resetFormFieldsForNonExemptedPatients]);

  const createVisitAttributesPayload = useCallback(() => {
    const values = getValues();
    setPaymentMethod?.(values.paymentMethods);
    const formPayload = [
      { uuid: visitAttributeTypes.isPatientExempted, value: values.isPatientExempted },
      { uuid: visitAttributeTypes.paymentMethods, value: values.paymentMethods?.uuid },
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
  }, [getValues, visitAttributeTypes, setPaymentMethod]);

  useEffect(() => {
    setAttributes(createVisitAttributesPayload());
  }, [isPatientExempted, paymentMethods, getValues, createVisitAttributesPayload, setAttributes]);

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
                  setValue('isPatientExempted', selected);
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
                  onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid)}
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
                  id="paymentMethods"
                  items={paymentModes}
                  itemToString={(item) => (item ? item.name : '')}
                  titleText={t('paymentMethodsTitle', 'Payment methods')}
                  placeholder={t('selectPaymentMethodPlaceholder', 'Select payment method')}
                />
              )}
            />
          </div>
        )}

        {paymentMethods?.name?.toLowerCase() === 'insurance' && isPatientExempted === 'false' && (
          <>
            <div className={styles.sectionFieldLayer}>
              <Controller
                control={control}
                name="insuranceScheme"
                render={({ field }) => (
                  <TextInput
                    className={styles.sectionField}
                    onChange={(e) => field.onChange(e.target.value)}
                    id="insurance-scheme"
                    type="text"
                    labelText={t('insuranceScheme', 'Insurance scheme')}
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
                    className={styles.sectionField}
                    onChange={(e) => field.onChange(e.target.value)}
                    id="policy-number"
                    type="text"
                    labelText={t('policyNumber', 'Policy number')}
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
