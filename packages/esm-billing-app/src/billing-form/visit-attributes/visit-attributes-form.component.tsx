import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-attributes-form.scss';
import { TextInput, InlineLoading, ComboBox, RadioButtonGroup, RadioButton, Layer } from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { string, z } from 'zod';
import { usePaymentMethods } from '../billing-form.resource';
import { useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../../config-schema';

type VisitAttributesFormProps = {
  setAttributes: (state) => void;
  setPaymentMethod?: (value: any) => void;
};

type VisitAttributesFormValue = {
  isPatientExempted: string;
  paymentMethods: { uuid: string; name: string };
  insuranceScheme: string;
  policyNumber: string;
  exemptionCategory: string;
};

const visitAttributesFormSchema = z.object({
  isPatientExempted: z.string(),
  paymentMethods: z.object({ uuid: z.string(), name: z.string() }),
  insuranceSchema: z.string(),
  policyNumber: z.string(),
  exemptionCategory: z.string(),
});

const VisitAttributesForm: React.FC<VisitAttributesFormProps> = ({ setAttributes, setPaymentMethod }) => {
  const { t } = useTranslation();
  const { visitAttributeTypes, patientExemptionCategories } = useConfig<BillingConfig>();
  const { control, getValues, watch, setValue } = useForm<VisitAttributesFormValue>({
    mode: 'all',
    defaultValues: {},
    resolver: zodResolver(visitAttributesFormSchema),
  });
  const [isPatientExempted, paymentMethods, insuranceSchema, policyNumber, exemptionCategory] = watch([
    'isPatientExempted',
    'paymentMethods',
    'insuranceScheme',
    'policyNumber',
    'exemptionCategory',
  ]);

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentMethods(true);

  const resetFormFieldsForNonExemptedPatients = useCallback(() => {
    if ((isPatientExempted && paymentMethods !== null) || paymentMethods !== undefined) {
      setValue('insuranceScheme', '');
      setValue('policyNumber', '');
    }
  }, [isPatientExempted, paymentMethods, setValue]);

  const createVisitAttributesPayload = useCallback(() => {
    const { exemptionCategory, paymentMethods, policyNumber, isPatientExempted } = getValues();
    setPaymentMethod(paymentMethods);
    resetFormFieldsForNonExemptedPatients();
    const formPayload = [
      { uuid: visitAttributeTypes.isPatientExempted, value: isPatientExempted },
      { uuid: visitAttributeTypes.paymentMethods, value: paymentMethods?.uuid },
      { uuid: visitAttributeTypes.policyNumber, value: policyNumber },
      { uuid: visitAttributeTypes.insuranceScheme, value: insuranceSchema },
      { uuid: visitAttributeTypes.exemptionCategory, value: exemptionCategory },
    ];
    const visitAttributesPayload = formPayload.filter(
      (item) => item.value !== undefined && item.value !== null && item.value !== '',
    );
    return Object.entries(visitAttributesPayload).map(([key, value]) => ({
      attributeType: value.uuid,
      value: value.value,
    }));
  }, [
    visitAttributeTypes.insuranceScheme,
    visitAttributeTypes.isPatientExempted,
    visitAttributeTypes.exemptionCategory,
    visitAttributeTypes.paymentMethods,
    visitAttributeTypes.policyNumber,
    getValues,
    insuranceSchema,
    resetFormFieldsForNonExemptedPatients,
    setPaymentMethod,
  ]);

  React.useEffect(() => {
    setAttributes(createVisitAttributesPayload());
  }, [paymentMethods, insuranceSchema, policyNumber, exemptionCategory, setAttributes, createVisitAttributesPayload]);

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
                onChange={(selected) => field.onChange(selected)}
                orientation="horizontal"
                legendText={t('isPatientExemptedLegend', 'Is patient exempted from payment?')}
                name="patientExemption">
                <RadioButton labelText="Yes" value={true} id="Yes" />
                <RadioButton labelText="No" value={false} id="No" />
              </RadioButtonGroup>
            )}
          />
        </div>
        {isPatientExempted && (
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

        {paymentMethods?.name?.toLocaleLowerCase() === 'insurance' && (
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
