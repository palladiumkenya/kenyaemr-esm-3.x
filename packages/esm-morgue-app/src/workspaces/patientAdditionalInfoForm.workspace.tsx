import {
  Button,
  ButtonSet,
  Column,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Dropdown,
  FilterableMultiSelect,
  Form,
  Layer,
  RadioButton,
  RadioButtonGroup,
  Search,
  SelectItem,
  InlineNotification,
  Stack,
  TextInput,
  Tile,
  TimePicker,
  InlineLoading,
  TimePickerSelect,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResponsiveWrapper, restBaseUrl, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import fuzzy from 'fuzzy';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { PENDING_PAYMENT_STATUS } from '../constants';
import {
  createPatientBill,
  useBillableItems,
  useCashPoint,
  usePaymentModes,
  useVisitType,
} from '../hook/useMorgue.resource';
import { useAdmissionLocation } from '../hook/useMortuaryAdmissionLocation';
import { getCurrentTime, patientInfoSchema } from '../utils/utils';
import styles from './patientAdditionalInfoForm.scss';
import { useMortuaryOperation } from '../hook/useAdmitPatient';
import DeceasedInfo from '../component/deceasedInfo/deceased-info.component';

interface PatientAdditionalInfoFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
}

const MAX_RESULTS = 5;

const PatientAdditionalInfoForm: React.FC<PatientAdditionalInfoFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const { data: visitTypes, isLoading: isLoadingVisitTypes } = useVisitType();
  const { lineItems, isLoading: isLoadingLineItems, error: lineError } = useBillableItems();
  const { time: defaultTime, period: defaultPeriod } = getCurrentTime();
  const { cashPoints, isLoading: isLoadingCashPoints, error: cashError } = useCashPoint();
  const cashPointUuid = cashPoints?.[0]?.uuid ?? '';

  const { insuranceSchemes } = useConfig({ externalModuleName: '@kenyaemr/esm-billing-app' });

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();
  const {
    admissionLocation,
    isLoading: isLoadingAdmissionLocation,
    mutate: mutateAdmissionLocation,
  } = useAdmissionLocation();

  const { morgueVisitTypeUuid, morgueDepartmentServiceTypeUuid, insurancepaymentModeUuid } = useConfig<ConfigObject>();
  const { admitBody, errorFetchingEmrConfiguration, isLoadingEmrConfiguration } = useMortuaryOperation();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPoliceCase, setIsPoliceCase] = useState<string | null>(null);

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof patientInfoSchema>>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues: {
      dateOfAdmission: new Date(),
      timeOfDeath: defaultTime,
      period: defaultPeriod,
      tagNumber: '',
      obNumber: '',
      policeName: '',
      policeIDNo: '',
      visitType: morgueVisitTypeUuid,
      paymentMethod: '',
      insuranceScheme: '',
      dischargeArea: '',
      policyNumber: '',
      services: [],
    },
  });

  const visitTypeValue = watch('visitType');
  const paymentMethodObservable = watch('paymentMethod');

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

  const onSubmit = async (data: z.infer<typeof patientInfoSchema>) => {
    const serviceUuid = data.services;

    const linesItems = lineItems
      .filter((item) => serviceUuid.includes(item.uuid))
      .map((item, index) => {
        const priceForPaymentMode =
          item.servicePrices.find((p) => p.paymentMode?.uuid === paymentModes) || item?.servicePrices[0];

        return {
          billableService: item.uuid,
          quantity: 1,
          price: priceForPaymentMode ? priceForPaymentMode.price : '0.000',
          priceName: 'Default',
          priceUuid: priceForPaymentMode ? priceForPaymentMode.uuid : '',
          lineItemOrder: index,
          paymentStatus: PENDING_PAYMENT_STATUS,
        };
      });

    const { admissionEncounter, compartment } = await admitBody(patientUuid, data);

    if (admissionEncounter && compartment) {
      showSnackbar({
        title: t('admissionSuccess', 'Deceased Admission'),
        subtitle: t('admissionSuccessMessage', 'Patient has been admitted to the mortuary successfully'),
        kind: 'success',
      });
    } else {
      showSnackbar({
        title: t('admissionError', 'Deceased Admission Error'),
        subtitle: t(
          'admissionError',
          'An error has occurred while admitting deceased patient to the mortuary, Contact system administrator',
        ),
        kind: 'error',
        isLowContrast: true,
      });
    }

    const billPayload = {
      lineItems: linesItems,
      cashPoint: cashPointUuid,
      patient: patientUuid,
      status: PENDING_PAYMENT_STATUS,
      payments: [],
    };

    await createPatientBill(billPayload).then(
      () => {
        showSnackbar({
          title: t('patientBill', 'Patient Bill'),
          subtitle: t('patientBillSuccess', 'Patient has been billed successfully'),
          kind: 'success',
        });
      },
      (error) => {
        const errorMessage = JSON.stringify(error?.responseBody?.error?.message?.replace(/\[/g, '').replace(/\]/g, ''));
        showSnackbar({
          title: 'Patient Bill Error',
          subtitle: `An error has occurred while creating patient bill, Contact system administrator quoting this error ${errorMessage}`,
          kind: 'error',
          isLowContrast: true,
        });
      },
    );
    mutateAdmissionLocation();
    closeWorkspace();
  };

  useEffect(() => {
    if (visitTypeValue === morgueVisitTypeUuid) {
      setValue('visitType', morgueVisitTypeUuid);
    }
  }, [visitTypeValue, morgueVisitTypeUuid, setValue]);

  const handlePoliceCaseChange = (selectedItem: string | null) => {
    setIsPoliceCase(selectedItem);
  };
  if (isLoadingEmrConfiguration) {
    return <InlineLoading status="active" description="Loading....." />;
  }
  if (errorFetchingEmrConfiguration) {
    return <InlineNotification kind="error" title={errorFetchingEmrConfiguration} />;
  }
  return (
    <Form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.formGrid}>
        <br />
        <DeceasedInfo patientUuid={patientUuid} />
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
          <div className={styles.dateTimeSection}>
            <ResponsiveWrapper>
              <Controller
                name="timeOfDeath"
                control={control}
                render={({ field }) => {
                  return (
                    <TimePicker
                      {...field}
                      id="time-of-death-picker"
                      labelText={t('timeAdmission', 'Time of admission*')}
                      className={styles.formAdmissionTimepicker}
                      invalid={!!errors.timeOfDeath}
                      invalidText={errors.timeOfDeath?.message}
                    />
                  );
                }}
              />
              <Controller
                name="period"
                control={control}
                render={({ field }) => (
                  <TimePickerSelect
                    {...field}
                    className={styles.formDeathTimepickerSelector}
                    id="time-picker-select"
                    labelText={t('selectPeriod', 'AM/PM')}
                    invalid={!!errors.period}
                    invalidText={errors.period?.message}>
                    <SelectItem value="AM" text="AM" />
                    <SelectItem value="PM" text="PM" />
                  </TimePickerSelect>
                )}
              />
            </ResponsiveWrapper>
          </div>
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
            {truncatedResults.some(({ uuid }) => uuid === morgueVisitTypeUuid) ? (
              <RadioButtonGroup
                className={styles.radioButtonGroup}
                defaultSelected={morgueVisitTypeUuid}
                orientation="vertical"
                onChange={(visitType) => setValue('visitType', visitType)}
                name="radio-button-group"
                valueSelected={visitTypeValue}
                invalid={!!errors.visitType}
                invalidText={errors.visitType?.message}>
                {truncatedResults
                  .filter(({ uuid }) => uuid === morgueVisitTypeUuid)
                  .map(({ uuid, display }) => (
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
        </Column>
        <Column>
          <div className={styles.sectionFieldLayer}>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Dropdown
                  {...field}
                  initialSelectedItem={field.value}
                  className={styles.sectionField}
                  onChange={({ selectedItem }) => field.onChange(selectedItem)}
                  id="paymentMethods"
                  items={paymentModes.map((mode) => mode.uuid)}
                  itemToString={(item) => paymentModes.find((mode) => mode.uuid === item)?.name ?? ''}
                  titleText={t('selectPaymentMethod', 'Select payment method')}
                  label={t('selectPaymentMethod', 'Select payment method')}
                />
              )}
            />
          </div>
        </Column>
        {paymentMethodObservable === insurancepaymentModeUuid && (
          <>
            <Column>
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
                    label={t('selectInsuranceScheme', 'Select insurance scheme')}
                    invalid={!!errors.insuranceScheme}
                    invalidText={errors.insuranceScheme?.message}
                  />
                )}
              />
            </Column>
            <Column>
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
                    invalid={!!errors.policyNumber}
                    invalidText={errors.policyNumber?.message}
                  />
                )}
              />
            </Column>
          </>
        )}
        {paymentMethodObservable && (
          <Column>
            <Controller
              control={control}
              name="services"
              render={({ field }) => {
                const availableServices = lineItems.filter(
                  (service) => service?.serviceType?.uuid === morgueDepartmentServiceTypeUuid,
                );
                return (
                  <>
                    {availableServices.length > 0 ? (
                      <>
                        <FilterableMultiSelect
                          id="billing-service"
                          className={styles.formAdmissionDatepicker}
                          titleText={t('searchServices', 'Search services')}
                          items={availableServices.map((service) => service.uuid)}
                          itemToString={(item) => availableServices.find((i) => i.uuid === item)?.name ?? ''}
                          onChange={({ selectedItems }) => {
                            field.onChange(selectedItems);
                          }}
                          placeholder={t('Service', 'Service')}
                          initialSelectedItems={field.value}
                          invalid={!!errors.services}
                          invalidText={errors.services?.message}
                        />
                      </>
                    ) : (
                      <InlineNotification
                        kind="warning"
                        title={t(
                          'noServicesAvailable',
                          'No service price has been configured for the mortuary department.',
                        )}
                        lowContrast
                      />
                    )}
                  </>
                );
              }}
            />
          </Column>
        )}
        <Column>
          <Controller
            name="tagNumber"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                id="tagNumber"
                className={styles.sectionField}
                placeholder={t('tagNumber', 'Tag Number*')}
                labelText={t('tagNumber', 'Tag Number*')}
                invalid={!!errors.tagNumber}
                invalidText={errors.tagNumber?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            name="dischargeArea"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                id="dischargeArea"
                className={styles.sectionField}
                placeholder={t('dischargeArea', 'Discharge Area')}
                labelText={t('dischargeArea', 'Discharge Area')}
                invalid={!!errors.dischargeArea}
                invalidText={errors.dischargeArea?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Dropdown
            onChange={(e) => handlePoliceCaseChange(e.selectedItem)}
            id="morgue-combobox"
            className={styles.formAdmissionDatepicker}
            items={['Yes', 'No']}
            itemToString={(item) => (item ? item : '')}
            label={t('ChooseOptions', 'Choose option')}
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
                    className={styles.formAdmissionDatepicker}
                    placeholder={t('obNos', 'OB Number')}
                    labelText={t('obNumber', 'OB Number')}
                    invalid={!!errors.obNumber}
                    invalidText={errors.obNumber?.message}
                    label={t('ChooseOptions', 'Choose option')}
                  />
                )}
              />
            </Column>
            <Column>
              <Controller
                name="policeName"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="policeName"
                    className={styles.formAdmissionDatepicker}
                    placeholder={t('policeNames', 'Police Name')}
                    labelText={t('policeName', 'Police name')}
                    invalid={!!errors.policeName}
                    invalidText={errors.policeName?.message}
                  />
                )}
              />
            </Column>
            <Column>
              <Controller
                name="policeIDNo"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="policeIDNo"
                    className={styles.formAdmissionDatepicker}
                    placeholder={t('policeID', 'Police ID number')}
                    labelText={t('policeIDNo', 'Police ID number')}
                    invalid={!!errors.policeIDNo}
                    invalidText={errors.policeIDNo?.message}
                  />
                )}
              />
            </Column>
          </>
        )}
        <Column>
          <Controller
            name="availableCompartment"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                id="avail-compartment"
                className={styles.sectionField}
                items={
                  admissionLocation?.bedLayouts?.map((bed) => ({
                    bedId: bed.bedId,
                    display:
                      bed.status === 'OCCUPIED'
                        ? `${bed.bedNumber} . ${bed.patients.map((patient) => patient?.person?.display).join(' . ')}`
                        : `${bed.bedNumber} . ${bed.status}`,
                  })) || []
                }
                itemToString={(item) => item?.display || ''}
                titleText={t('availableCompartment', 'Available Compartment')}
                label={t('ChooseOptions', 'Choose option')}
                onChange={({ selectedItem }) => field.onChange(selectedItem?.bedId)}
                initialSelectedItems={field.value}
                invalid={!!errors.availableCompartment}
                invalidText={errors.availableCompartment?.message}
              />
            )}
          />
        </Column>
        <ButtonSet className={styles.buttonSet}>
          <Button style={{ maxWidth: '65%' }} size="lg" kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button style={{ maxWidth: '60%' }} kind="primary" size="lg" type="submit">
            {t('admit', 'Admit')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default PatientAdditionalInfoForm;
