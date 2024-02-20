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
import { uuidsMap } from '../../constants';

type VisitAttributesFormProps = {
  setAttributes: (state) => void;
  setPaymentMethod?: (value: any) => void;
};

type VisitAttributesFormValue = {
  isPatientExempted: string;
  paymentMethods: string;
  insuranceScheme: string;
  policyNumber: string;
  patientCategory: string;
};

const visitAttributesFormSchema = z.object({
  isPatientExempted: z.string(),
  paymentMethods: z.string(),
  insuranceSchema: z.string(),
  policyNumber: z.string(),
  patientCategory: z.string(),
});

const VisitAttributesForm: React.FC<VisitAttributesFormProps> = ({ setAttributes, setPaymentMethod }) => {
  const { t } = useTranslation();
  const config = useConfig<BillingConfig>();
  const { control, getValues, watch, setValue } = useForm<VisitAttributesFormValue>({
    mode: 'all',
    defaultValues: {},
    resolver: zodResolver(visitAttributesFormSchema),
  });
  const [isPatientExempted, paymentMethods, insuranceSchema, policyNumber, patientCategory] = watch([
    'isPatientExempted',
    'paymentMethods',
    'insuranceScheme',
    'policyNumber',
    'patientCategory',
  ]);

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentMethods(true);

  const resetFormFieldsForNonExemptedPatients = useCallback(() => {
    if ((isPatientExempted === uuidsMap.isNotExceptedUuid && paymentMethods !== null) || paymentMethods !== undefined) {
      setValue('insuranceScheme', '');
      setValue('policyNumber', '');
    }
  }, [isPatientExempted, paymentMethods, setValue]);

  const createVisitAttributesPayload = useCallback(() => {
    const { patientCategory, paymentMethods, policyNumber, isPatientExempted } = getValues();
    setPaymentMethod(paymentMethods);
    resetFormFieldsForNonExemptedPatients();
    const formPayload = [
      { uuid: config.isPatientExempted, value: isPatientExempted },
      { uuid: config.paymentMethods, value: paymentMethods },
      { uuid: config.policyNumber, value: policyNumber },
      { uuid: config.insuranceScheme, value: insuranceSchema },
      { uuid: config.patientCategory, value: patientCategory },
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
    config.patientCategory,
    config.paymentMethods,
    config.policyNumber,
    getValues,
    insuranceSchema,
    resetFormFieldsForNonExemptedPatients,
    setPaymentMethod,
  ]);

  React.useEffect(() => {
    setAttributes(createVisitAttributesPayload());
  }, [paymentMethods, insuranceSchema, policyNumber, patientCategory, setAttributes, createVisitAttributesPayload]);

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
                legendText={t('isPatientExemptedLegend', 'Is patient excepted from payment?')}
                name="payment-details-group">
                <RadioButton labelText="Yes" value={uuidsMap.isExceptedUuid} id="Yes" />
                <RadioButton labelText="No" value={uuidsMap.isNotExceptedUuid} id="No" />
              </RadioButtonGroup>
            )}
          />
        </Layer>
        {isPatientExempted === uuidsMap.isExceptedUuid && (
          <Layer className={styles.sectionFieldLayer}>
            <Controller
              control={control}
              name="patientCategory"
              render={({ field }) => (
                <ComboBox
                  className={styles.sectionField}
                  onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid)}
                  id="patientCategory"
                  items={[{ uuid: '162277AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'In Prision' }]}
                  itemToString={(item) => (item ? item.display : '')}
                  titleText={t('patientCategory', 'Patient category')}
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

        {paymentMethods === uuidsMap.insuranceSchemeUuid && isPatientExempted === uuidsMap.isExceptedUuid && (
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
