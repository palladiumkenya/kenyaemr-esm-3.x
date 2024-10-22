import {
  Button,
  ButtonSet,
  ComboBox,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  TextArea,
  Stack,
  TextInput,
  TimePicker,
  TimePickerSelect,
  SelectItem,
  RadioButtonGroup,
  RadioButton,
  Layer,
  Tile,
  Search,
  FilterableMultiSelect,
} from '@carbon/react';
import { ResponsiveWrapper, useLayoutType, useConfig } from '@openmrs/esm-framework';
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from './patientAdditionalInfoForm.scss';
import { useBillableItems, usePaymentModes, useVisitType } from '../hook/useMorgue.resource';
import fuzzy from 'fuzzy';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import isEmpty from 'lodash-es/isEmpty';
import { BillingConfig, ConfigObject } from '../config-schema';

interface PatientAdditionalInfoFormProps {
  closeWorkspace: () => void;
}

const MAX_RESULTS = 5;

const patientInfoSchema = z.object({
  dateOfAdmission: z.date().refine((date) => !!date, 'Date of admission is required'),
  timeOfDeath: z
    .string()
    .nonempty('Time of death is required')
    .regex(/^(0[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, 'Time of death must be in the format hh:mm AM/PM'),
  tagNumber: z.string().nonempty('Tag number is required'),
  obNumber: z.string().optional(),
  policeReport: z.string().optional(),
  visitType: z.string().nonempty('Visit type is required'),
  availableCompartment: z.string().optional(),
});

const PatientAdditionalInfoForm: React.FC<PatientAdditionalInfoFormProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { data: visitTypes, isLoading: isLoadingVisitTypes } = useVisitType();
  const { lineItems, isLoading: isLoadingLineItems, error: lineError } = useBillableItems();

  const { insuranceSchemes } = useConfig<BillingConfig>();

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();

  const { morgueVisitTypeUuid, morgueDepartmentServiceTypeUuid } = useConfig<ConfigObject>();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPoliceCase, setIsPoliceCase] = useState<string | null>(null);

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientInfoSchema),
    defaultValues: {
      dateOfAdmission: '',
      timeOfDeath: '',
      tagNumber: '',
      obNumber: '',
      policeReport: '',
      visitType: morgueVisitTypeUuid,
      availableCompartment: '',
      paymentMethods: '',
      insuranceScheme: '',
      policyNumber: '',
      services: '',
    },
  });

  const visitTypeValue = watch('visitType');
  const paymentMethods = watch('paymentMethods');

  const filteredVisitTypes = useMemo(() => {
    if (!visitTypes) {
      return [];
    }
    if (!searchTerm) {
      return visitTypes;
    }
    return fuzzy
      .filter(searchTerm, visitTypes, { extract: (visitType) => visitType.display })
      .map((result) => result.original);
  }, [searchTerm, visitTypes]);

  const truncatedResults = filteredVisitTypes.slice(0, MAX_RESULTS);

  const onSubmit = (data: any) => {
    if (!isEmpty(data)) {
      // console.log('Form submitted with data: ', data);
    }
  };

  useEffect(() => {
    if (visitTypeValue === morgueVisitTypeUuid) {
      setValue('visitType', morgueVisitTypeUuid);
    }
  }, [visitTypeValue, morgueVisitTypeUuid, setValue]);

  const handlePoliceCaseChange = (selectedItem: string | null) => {
    setIsPoliceCase(selectedItem);
  };

  return (
    <Form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.formGrid}>
        <span className={styles.formSubHeader}>{t('moreDetails', 'More Details')}</span>
        <Column>
          <Controller
            name="dateOfAdmission"
            control={control}
            render={({ field }) => (
              <DatePicker
                datePickerType="single"
                className={styles.formAdmissionDatepicker}
                onChange={(event) => {
                  if (event.length) {
                    field.onChange(event[0]);
                  }
                }}
                value={field.value ? new Date(field.value) : null}>
                <DatePickerInput
                  id="date-of-admission"
                  placeholder="mm/dd/yyyy"
                  labelText={t('dateOfAdmission', 'Date of admission')}
                  invalid={!!errors.dateOfAdmission}
                  invalidText={errors.dateOfAdmission?.message}
                />
              </DatePicker>
            )}
          />
        </Column>

        <Column>
          <Controller
            name="timeOfDeath"
            control={control}
            render={({ field }) => {
              const [timeValue, periodValue] = field.value ? field.value.split(' ') : ['', 'AM'];

              return (
                <div className={styles.dateTimeSection}>
                  <ResponsiveWrapper>
                    <TimePicker
                      id="time-of-death-picker"
                      labelText={t('timeAdmission', 'Time of admission*')}
                      className={styles.formAdmissionTimepicker}
                      value={timeValue}
                      onChange={(e) => {
                        field.onChange(`${e.target.value} ${periodValue}`);
                      }}
                      invalid={!!errors.timeOfDeath}
                      invalidText={errors.timeOfDeath?.message}
                    />
                    <TimePickerSelect
                      className={styles.formDeathTimepickerSelector}
                      id="time-picker-select"
                      labelText={t('selectPeriod', 'AM/PM')}
                      value={periodValue}
                      onChange={(e) => {
                        field.onChange(`${timeValue} ${e.target.value}`);
                      }}
                      invalid={!!errors.timeOfDeath}
                      invalidText={errors.timeOfDeath?.message}>
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  </ResponsiveWrapper>
                </div>
              );
            }}
          />
        </Column>

        <Column>
          <span className={styles.visitTypeHeader}>{t('visitTypes', 'Visit type')}</span>

          <div className={classNames(styles.visitTypeOverviewWrapper)}>
            <ResponsiveWrapper>
              <Search
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('searchForAVisitType', 'Search for a visit type')}
                labelText=""
              />
            </ResponsiveWrapper>
            {truncatedResults.length > 0 ? (
              <RadioButtonGroup
                className={styles.radioButtonGroup}
                defaultSelected={morgueVisitTypeUuid}
                orientation="vertical"
                onChange={(visitType) => setValue('visitType', visitType)}
                name="radio-button-group"
                valueSelected={visitTypeValue}>
                {truncatedResults.map(({ uuid, display }) => (
                  <RadioButton
                    key={uuid}
                    className={styles.radioButton}
                    id={uuid}
                    labelText={display}
                    value={uuid}
                    disabled={visitTypeValue === morgueVisitTypeUuid && uuid !== morgueVisitTypeUuid}
                  />
                ))}
              </RadioButtonGroup>
            ) : (
              <Layer>
                <Tile className={styles.tile}>
                  <EmptyDataIllustration />
                  <p className={styles.content}>
                    {t('noVisitTypesMatchingSearch', 'There are no visit types matching this search text')}
                  </p>
                </Tile>
              </Layer>
            )}
          </div>
          {errors.visitType && <span>{errors.visitType.message}</span>}
        </Column>
        <Column>
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
                  titleText={t('selectPaymentMethod', 'Select payment method')}
                  placeholder={t('selectPaymentMethod', 'Select payment method')}
                />
              )}
            />
          </div>
        </Column>

        {/* <>
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
                  className={styles.sectionField}
                  onChange={(e) => field.onChange(e.target.value)}
                  id="policy-number"
                  type="text"
                  labelText={t('policyNumber', 'Policy number')}
                  placeholder={t('enterPolicyNumber', 'Enter policy number')}
                />
              )}ChartCO
            />
          </div>
        </> */}
        <Column>
          <div className={styles.sectionField}>
            <Controller
              control={control}
              name="services"
              render={({ field }) => (
                <FilterableMultiSelect
                  id="billing-service"
                  titleText={t('searchServices', 'Search services')}
                  items={lineItems.filter((service) => service?.serviceType?.uuid === morgueDepartmentServiceTypeUuid)}
                  itemToString={(item) => (item ? item?.name : '')}
                  onChange={({ selectedItem }) => field.onChange(selectedItem)}
                />
              )}
            />
          </div>
        </Column>
        <Column>
          <Controller
            name="tagNumber"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                id="tagNumber"
                placeholder={t('tagNumber', 'Tag Number*')}
                labelText={t('tagNumber', 'Tag Number*')}
                invalid={!!errors.tagNumber}
                invalidText={errors.tagNumber?.message}
              />
            )}
          />
        </Column>

        <Column>
          <ComboBox
            onChange={(e) => handlePoliceCaseChange(e.selectedItem)}
            id="morgue-combobox"
            items={['Yes', 'No']}
            itemToString={(item) => (item ? item : '')}
            titleText={t(
              'isPoliceCase',
              'Is the body associated with a police case? If so, can you provide the OB number?*',
            )}
          />
        </Column>

        {isPoliceCase === 'Yes' && (
          <>
            <Column>
              <Controller
                name="obNumber"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="obNumber"
                    placeholder={t('obNumber', 'OB Number*')}
                    labelText={t('obNumber', 'OB Number*')}
                  />
                )}
              />
              {errors.obNumber && <span>{errors.obNumber.message}</span>}
            </Column>
            <Column>
              <Controller
                name="policeReport"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    labelText={t('policeReport', "Police's report")}
                    rows={4}
                    id="police-report-text-area"
                  />
                )}
              />
            </Column>
          </>
        )}

        {/* Available Compartment */}
        <Column>
          <Controller
            name="availableCompartment"
            control={control}
            render={({ field }) => (
              <ComboBox
                {...field}
                id="avail-compartment"
                items={['empty-compartment-1', 'empty-compartment-2']}
                itemToString={(item) => (item ? item : '')}
                titleText={t('availableCompartment', 'Available Compartment')}
              />
            )}
          />
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} size="lg" kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" size="lg" type="submit">
          {t('admit', 'Admit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default PatientAdditionalInfoForm;
