import React from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton, TextInput, ComboBox } from '@carbon/react';
import styles from './visit-attributes-form.scss';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type VisitAttributesFormProps = { setAttributes: (state) => void };

type VisitAttributesFormValue = {
  paymentDetails: string;
  paymentMethods: string;
  insuranceSchema: string;
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

const VisitAttributesForm: React.FC<VisitAttributesFormProps> = ({ setAttributes }) => {
  const { t } = useTranslation();
  const { control, getValues, watch } = useForm<VisitAttributesFormValue>({
    mode: 'all',
    defaultValues: {},
    resolver: zodResolver(visitAttributesFormSchema),
  });
  const [paymentDetails, paymentMethods, insuranceSchema, policyNumber, patientCategory] = watch([
    'paymentDetails',
    'paymentMethods',
    'insuranceSchema',
    'policyNumber',
    'patientCategory',
  ]);

  React.useEffect(() => {
    setAttributes(createVisitAttributesPayload());
  }, [paymentDetails, paymentMethods, insuranceSchema, policyNumber, patientCategory]);

  const createVisitAttributesPayload = () => {
    const { patientCategory, paymentMethods, policyNumber, paymentDetails } = getValues();
    const formPayload = [
      { uuid: 'caf2124f-00a9-4620-a250-efd8535afd6d', value: paymentDetails },
      { uuid: 'c39b684c-250f-4781-a157-d6ad7353bc90', value: paymentMethods },
      { uuid: 'c39b684c-250f-4781-a157-d6ad7353bc90', value: policyNumber },
      { uuid: 'c39b684c-250f-4781-a157-d6ad7353bc90', value: patientCategory },
      { uuid: '919b51c9-8e2e-468f-8354-181bf3e55786', value: true },
    ];
    const visitAttributesPayload = formPayload.filter(
      (item) => item.value !== undefined && item.value !== null && item.value !== '',
    );
    return Object.entries(visitAttributesPayload).map(([key, value]) => ({
      attributeType: value.uuid,
      value: value.value,
    }));
  };

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
            <RadioButton labelText="Paying" value="1c30ee58-82d4-4ea4-a8c1-4bf2f9dfc8cf" id="radio-1" />
            <RadioButton labelText="Non paying" value="a28d7929-050a-4249-a61a-551e9b8cc102" id="radio-2" />
          </RadioButtonGroup>
        )}
      />

      {paymentDetails === '1c30ee58-82d4-4ea4-a8c1-4bf2f9dfc8cf' && (
        <Controller
          control={control}
          name="paymentMethods"
          render={({ field }) => (
            <ComboBox
              className={styles.sectionField}
              onChange={({ selectedItem }) => field.onChange(selectedItem.uuid)}
              id="paymentMethods"
              items={[
                { text: 'MPESA', uuid: '0dcd014d-5843-4458-b407-d415d8709858' },
                { text: 'CASH', uuid: '7fd55783-101d-457b-afc4-451fa8abb2cb' },
                { text: 'INSURANCE', uuid: '29cc28bb-de26-4964-b109-41919f044a70' },
              ]}
              itemToString={(item) => (item ? item.text : '')}
              titleText={t('paymentMethods', 'Payment methods')}
            />
          )}
        />
      )}

      {paymentMethods === '29cc28bb-de26-4964-b109-41919f044a70' &&
        paymentDetails === '1c30ee58-82d4-4ea4-a8c1-4bf2f9dfc8cf' && (
          <>
            <Controller
              control={control}
              name="insuranceSchema"
              render={({ field }) => (
                <TextInput
                  className={styles.sectionField}
                  onChange={(e) => field.onChange(e.target.value)}
                  id="insurance-schema"
                  type="text"
                  labelText={t('insuranceSchema', 'Insurance schema')}
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

      {paymentDetails === 'a28d7929-050a-4249-a61a-551e9b8cc102' && (
        <Controller
          control={control}
          name="patientCategory"
          render={({ field }) => (
            <ComboBox
              className={styles.sectionField}
              onChange={({ selectedItem }) => field.onChange(selectedItem.uuid)}
              id="patientCategory"
              items={[
                { text: 'Child under 5', uuid: '2d61b762-6e32-4e2e-811f-ac72cbd3600a' },
                { text: 'Student', uuid: '159465AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
              ]}
              itemToString={(item) => (item ? item.text : '')}
              titleText={t('patientCategory', 'Patient category')}
            />
          )}
        />
      )}
    </section>
  );
};

export default VisitAttributesForm;
