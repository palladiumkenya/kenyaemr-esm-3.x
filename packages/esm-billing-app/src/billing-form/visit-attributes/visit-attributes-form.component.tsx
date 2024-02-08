import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-attributes-form.scss';
import { TextInput, InlineLoading, ComboBox, RadioButtonGroup, RadioButton } from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useConceptAnswers, usePaymentMethods } from '../billing-form.resource';
import { useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../../config-schema';
import { uuidsMap } from '../../constants';

type VisitAttributesFormProps = {
  setAttributes: (state) => void;
  setPaymentMethod?: (value: any) => void;
};

type VisitAttributesFormValue = {
  paymentDetails: string;
  paymentMethods: string;
  insuranceScheme: string;
  policyNumber: string;
  patientCategory: string;
};

const visitAttributesFormSchema = z.object({
  paymentDetails: z.string(),
  paymentMethods: z.string(),
  insuranceSchema: z.string(),
  policyNumber: z.string(),
  patientCategory: z.string(),
});

const VisitAttributesForm: React.FC<VisitAttributesFormProps> = ({ setAttributes, setPaymentMethod }) => {
  const { t } = useTranslation();
  const config = useConfig<BillingConfig>();
  const { conceptAnswers = [], isLoading, error } = useConceptAnswers(uuidsMap.nonPayingPatientConceptUuid);
  const { control, getValues, watch } = useForm<VisitAttributesFormValue>({
    mode: 'all',
    defaultValues: {},
    resolver: zodResolver(visitAttributesFormSchema),
  });
  const [paymentDetails, paymentMethods, insuranceSchema, policyNumber, patientCategory] = watch([
    'paymentDetails',
    'paymentMethods',
    'insuranceScheme',
    'policyNumber',
    'patientCategory',
  ]);

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentMethods(true);

  const createVisitAttributesPayload = useCallback(() => {
    const { patientCategory, paymentMethods, policyNumber, paymentDetails } = getValues();
    setPaymentMethod(paymentMethods);
    const formPayload = [
      { uuid: config.paymentDetails, value: paymentDetails },
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
    config.patientCategory,
    config.paymentDetails,
    config.paymentMethods,
    config.policyNumber,
    getValues,
    insuranceSchema,
    setPaymentMethod,
  ]);

  React.useEffect(() => {
    setAttributes(createVisitAttributesPayload());
  }, [
    paymentDetails,
    paymentMethods,
    insuranceSchema,
    policyNumber,
    patientCategory,
    setAttributes,
    createVisitAttributesPayload,
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
      <div className={styles.sectionTitle}>{t('paymentDetails', 'Payment Details')}</div>
      <Controller
        name="paymentDetails"
        control={control}
        render={({ field }) => (
          <RadioButtonGroup
            onChange={(selected) => field.onChange(selected)}
            orientation="vertical"
            legendText={t('paymentDetails', 'Payment Details')}
            name="payment-details-group">
            <RadioButton labelText="Paying" value={uuidsMap.payingUuid} id="paying" />
            <RadioButton labelText="Non paying" value={uuidsMap.nonPayingUuid} id="nonPaying" />
          </RadioButtonGroup>
        )}
      />

      {paymentDetails === uuidsMap.payingUuid && (
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
              titleText={t('paymentMethods', 'Payment methods')}
              placeholder={t('selectPaymentMethod', 'Select payment method')}
            />
          )}
        />
      )}

      {paymentMethods === uuidsMap.insuranceSchemeUuid && paymentDetails === uuidsMap.payingUuid && (
        <>
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
        </>
      )}

      {paymentDetails === uuidsMap.nonPayingUuid && (
        <Controller
          control={control}
          name="patientCategory"
          render={({ field }) => (
            <ComboBox
              className={styles.sectionField}
              onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid)}
              id="patientCategory"
              items={conceptAnswers}
              itemToString={(item) => (item ? item.display : '')}
              titleText={t('patientCategory', 'Patient category')}
            />
          )}
        />
      )}
    </section>
  );
};

export default VisitAttributesForm;
