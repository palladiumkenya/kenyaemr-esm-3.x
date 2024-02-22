import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-attributes-form.scss';
import { TextInput, InlineLoading, ComboBox, RadioButtonGroup, RadioButton, Layer } from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentMethods } from '../billing-form.resource';
import { useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../../config-schema';
import { IN_PRISON_CONCEPT, uuidsMap } from '../../constants';

type VisitAttributesFormProps = {
  setAttributes: (state) => void;
  setPaymentMethod?: (value: any) => void;
};

type VisitAttributesFormValue = {
  isPatientExempted: string;
  paymentMethods: string;
  insuranceScheme: string;
  policyNumber: string;
  exemptionCategory: string;
};

const visitAttributesFormSchema = z.object({
  isPatientExempted: z.string(),
  paymentMethods: z.string(),
  insuranceSchema: z.string(),
  policyNumber: z.string(),
  exemptionCategory: z.string(),
});

const VisitAttributesForm: React.FC<VisitAttributesFormProps> = ({ setAttributes, setPaymentMethod }) => {
  const { t } = useTranslation();
  const config = useConfig<BillingConfig>();
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
    if ((isPatientExempted === uuidsMap.isNotExemptedUuid && paymentMethods !== null) || paymentMethods !== undefined) {
      setValue('insuranceScheme', '');
      setValue('policyNumber', '');
    }
  }, [isPatientExempted, paymentMethods, setValue]);

  const createVisitAttributesPayload = useCallback(() => {
    const { exemptionCategory, paymentMethods, policyNumber, isPatientExempted } = getValues();
    setPaymentMethod(paymentMethods);
    resetFormFieldsForNonExemptedPatients();
    const formPayload = [
      { uuid: config.isPatientExempted, value: isPatientExempted },
      { uuid: config.paymentMethods, value: paymentMethods },
      { uuid: config.policyNumber, value: policyNumber },
      { uuid: config.insuranceScheme, value: insuranceSchema },
      { uuid: config.exemptionCategory, value: exemptionCategory },
    ];
    const visitAttributesPayload = formPayload.filter(
      (item) => item.value !== undefined && item.value !== null && item.value !== '',
    );
    return Object.entries(visitAttributesPayload).map(([key, value]) => ({
      attributeType: value.uuid,
      value: value.value,
    }));
  }, [
    config.insuranceScheme,
    config.isPatientExempted,
    config.exemptionCategory,
    config.paymentMethods,
    config.policyNumber,
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
        <Layer className={styles.sectionFieldLayer}>
          <Controller
            name="isPatientExempted"
            control={control}
            render={({ field }) => (
              <RadioButtonGroup
                onChange={(selected) => field.onChange(selected)}
                orientation="horizontal"
                legendText={t('isPatientExemptedLegend', 'Is patient exempted from payment?')}
                name="patientExemption">
                <RadioButton labelText="Yes" value={uuidsMap.isExemptedUuid} id="Yes" />
                <RadioButton labelText="No" value={uuidsMap.isNotExemptedUuid} id="No" />
              </RadioButtonGroup>
            )}
          />
        </Layer>
        {isPatientExempted === uuidsMap.isExemptedUuid && (
          <Layer className={styles.sectionFieldLayer}>
            <Controller
              control={control}
              name="exemptionCategory"
              render={({ field }) => (
                <ComboBox
                  className={styles.sectionField}
                  onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid)}
                  id="exemptionCategory"
                  items={[{ ...IN_PRISON_CONCEPT }]}
                  itemToString={(item) => (item ? item.display : '')}
                  titleText={t('exemptionCategory', 'Exemption category')}
                  placeholder={t('selectExemptionCategory', 'Select exemption category')}
                />
              )}
            />
          </Layer>
        )}
        <Layer className={styles.sectionFieldLayer}>
          <Controller
            control={control}
            name="paymentMethods"
            render={({ field }) => (
              <ComboBox
                className={styles.sectionField}
                onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid)}
                id="paymentMethods"
                items={paymentModes}
                itemToString={(item) => (item ? item.name : '')}
                titleText={t('paymentMethodsTitle', 'Payment methods')}
                placeholder={t('selectPaymentMethodPlaceholder', 'Select payment method')}
              />
            )}
          />
        </Layer>

        {paymentMethods === uuidsMap.insuranceSchemeUuid && isPatientExempted === uuidsMap.isExemptedUuid && (
          <>
            <Layer className={styles.sectionFieldLayer}>
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
            </Layer>
            <Layer className={styles.sectionFieldLayer}>
              <Controller
                control={control}
                name="policyNumber"
                render={({ field }) => (
                  <TextInput
                    className={styles.sectionField}
                    onChange={(e) => field.onChange(e.target.value)}
                    {...field}
                    id="policy-number"
                    type="text"
                    labelText={t('policyNumber', 'Policy number')}
                  />
                )}
              />
            </Layer>
          </>
        )}
      </div>
    </section>
  );
};

export default VisitAttributesForm;
