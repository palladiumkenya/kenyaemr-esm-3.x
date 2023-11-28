import React from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton, Form, Stack, Select, SelectItem, TextInput } from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './visit-billing-info.scss';
import { useForm, Controller, FormProvider, useWatch } from 'react-hook-form';

type VisitBillingInfoProps = {};

type BillingInfoData = {
  patientType: string;
  paymentMethod: string;
  insuranceSchema: string;
  policyNumber: string;
  nonPayingPatientCategory: string;
};

const BillingVisitSchema = z.object({
  patientType: z.string().optional(),
  paymentMethod: z.string(),
  insuranceSchema: z.string(),
  policyNumber: z.string(),
  nonPayingPatientCategory: z.string(),
});

const VisitBillingInfo: React.FC<VisitBillingInfoProps> = () => {
  const defaultValues = {};
  const methods = useForm<BillingInfoData>({
    mode: 'all',
    resolver: zodResolver(BillingVisitSchema),
    defaultValues,
  });

  const { handleSubmit, control, getValues, formState, setError } = methods;

  const { t } = useTranslation();
  return (
    <Form>
      <Stack>
        <div className={styles.sectionTitle}>{t('patientType', 'Patient type')}</div>
        <Controller
          name="patientType"
          control={control}
          render={({ field: { onChange } }) => (
            <RadioButtonGroup
              legendText={t('selectPatientType', 'Select patient type')}
              orientation="vertical"
              onChange={(e) => onChange(e)}
              name="patientType">
              <RadioButton labelText={t('paying', 'Paying')} value="payingPatientType" id="payingPatientType" />
              <RadioButton
                labelText={t('nonPaying', 'Non paying')}
                value="nonPayingPatientType"
                id="nonPayingPatientType"
              />
            </RadioButtonGroup>
          )}
        />

        <Controller
          name="paymentMethod"
          control={control}
          render={({ field: { onChange } }) => (
            <Select id={`paymentMethod`} onChange={onChange} labelText="Payment method">
              <SelectItem value="" text="" />
              <SelectItem value="option-1" text="Cash" />
              <SelectItem value="option-2" text="MPESA" />
              <SelectItem value="option-3" text="Insuarance" />
            </Select>
          )}
        />

        <Controller
          name="insuranceSchema"
          control={control}
          render={({ field: { onChange } }) => (
            <Select id={`insuranceScheme`} onChange={onChange} labelText="Insurance scheme">
              <SelectItem value="" text="" />
              <SelectItem value="option-1" text="NHIF" />
              <SelectItem value="option-2" text="Jubilee Insurance" />
              <SelectItem value="option-3" text="Old mutual" />
            </Select>
          )}
        />

        {/* Insurance details */}
        <Controller
          name="policyNumber"
          control={control}
          render={({ field: { onChange } }) => (
            <TextInput
              id="policyNumber"
              onChange={onChange}
              type="text"
              labelText={t('policyNumber', 'Policy Number')}
            />
          )}
        />

        {/* Non paying patient section */}
        <Controller
          name="nonPayingPatientCategory"
          control={control}
          render={({ field: { onChange } }) => (
            <Select id={`patientCategory`} onChange={onChange} labelText={t('patientCategory', 'Patient catergory')}>
              <SelectItem value="" text="" />
              <SelectItem value="option-1" text="Refugee" />
              <SelectItem value="option-2" text="Under 5 years old" />
              <SelectItem value="option-3" text="Senior citizen" />
              <SelectItem value="option-4" text="Prision inmate" />
              <SelectItem value="option-5" text="Other" />
            </Select>
          )}
        />
      </Stack>
      <input type="submit" />
    </Form>
  );
};

export default VisitBillingInfo;
