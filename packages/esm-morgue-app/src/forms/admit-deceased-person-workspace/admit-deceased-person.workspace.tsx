import React, { useEffect, useMemo, useState } from 'react';
import {
  type DefaultWorkspaceProps,
  ResponsiveWrapper,
  useLayoutType,
  showSnackbar,
  useConfig,
  restBaseUrl,
  ExtensionSlot,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import {
  ButtonSet,
  Button,
  InlineLoading,
  TextInput,
  FormGroup,
  Stack,
  Form,
  FilterableMultiSelect,
  DatePicker,
  Column,
  DatePickerInput,
  TimePicker,
  TimePickerSelect,
  SelectItem,
  Search,
  RadioButton,
  RadioButtonGroup,
  Tag,
  Layer,
  Tile,
  Dropdown,
  ComboBox,
  InlineNotification,
} from '@carbon/react';
import classNames from 'classnames';
import { z } from 'zod';
import fuzzy from 'fuzzy';
import styles from './admit-deceased-person.scss';
import {
  createPatientBill,
  useBillableItems,
  useCashPoint,
  useMortuaryOperation,
  usePaymentModes,
  useVisitType,
} from './admit-deceased-person.resource';
import { getCurrentTime } from '../../utils/utils';
import { deceasedPatientAdmitSchema } from '../../schemas';
import { ConfigObject } from '../../config-schema';
import { DeceasedPatientHeader } from '../../deceased-patient-header/deceased-patient-header.component';
import { type MortuaryLocationResponse, type MortuaryPatient } from '../../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { PENDING_PAYMENT_STATUS } from '../../constants';
import { mutate } from 'swr';

type AdmitDeceasedPersonProps = DefaultWorkspaceProps & {
  patientData: MortuaryPatient;
  mortuaryLocation: MortuaryLocationResponse;
  mutated;
  deceasedPatientUuid?: string;
};

const MAX_RESULTS = 5;

const AdmitDeceasedPerson: React.FC<AdmitDeceasedPersonProps> = ({
  closeWorkspace,
  patientData,
  mortuaryLocation,
  mutated,
  deceasedPatientUuid,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');
  const [isPoliceCase, setIsPoliceCase] = useState<string | null>(null);

  const { data: visitTypes, isLoading: isLoadingVisitTypes } = useVisitType();
  const { lineItems, isLoading: isLoadingLineItems, error: lineError } = useBillableItems();
  const { time: defaultTime, period: defaultPeriod } = getCurrentTime();
  const { admitBody, errorFetchingEmrConfiguration, isLoadingEmrConfiguration } = useMortuaryOperation(
    mortuaryLocation?.ward?.uuid,
  );

  const { cashPoints } = useCashPoint();
  const cashPointUuid = cashPoints?.[0]?.uuid ?? '';

  const patientUuid = patientData?.patient?.uuid || deceasedPatientUuid;

  const { insuranceSchemes } = useConfig({ externalModuleName: '@kenyaemr/esm-billing-app' });

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();

  const { morgueVisitTypeUuid, morgueDepartmentServiceTypeUuid, insurancepaymentModeUuid } = useConfig<ConfigObject>();

  const handlePoliceCaseChange = (selectedItem: string | null) => {
    setIsPoliceCase(selectedItem);
  };

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<z.infer<typeof deceasedPatientAdmitSchema>>({
    resolver: zodResolver(deceasedPatientAdmitSchema),
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
      availableCompartment: 0,
    },
  });

  const currentVisitType = visitTypes?.find((vt) => vt.uuid === morgueVisitTypeUuid);
  const paymentMethodObservable = watch('paymentMethod');

  const filteredBeds = useMemo(() => {
    if (!mortuaryLocation?.bedLayouts) {
      return [];
    }

    if (!searchTerm) {
      return mortuaryLocation.bedLayouts;
    }

    return mortuaryLocation.bedLayouts.filter(
      (bed) =>
        bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bed.bedType?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bed.status?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [mortuaryLocation?.bedLayouts, searchTerm]);

  const onSubmit = async (data: z.infer<typeof deceasedPatientAdmitSchema>) => {
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
    mutated();
    closeWorkspace();
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContainer}>
        <Stack gap={3}>
          <DeceasedPatientHeader patientData={patientData} />
          <ResponsiveWrapper>
            <FormGroup legendText="">
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
            </FormGroup>
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <FormGroup legendText="">
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
                          id="time-picker-select">
                          <SelectItem value="AM" text="AM" />
                          <SelectItem value="PM" text="PM" />
                        </TimePickerSelect>
                      )}
                    />
                  </ResponsiveWrapper>
                </div>
              </Column>
            </FormGroup>
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <FormGroup legendText="">
              <Controller
                control={control}
                name="visitType"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    className={styles.sectionField}
                    id="visit-type"
                    type="text"
                    labelText={t('visitType', 'Visit type')}
                    value={currentVisitType?.display || ''}
                    invalid={!!errors.visitType}
                    invalidText={errors.visitType?.message}
                    disabled={isLoadingVisitTypes}
                    readOnly
                  />
                )}
              />
            </FormGroup>
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <FormGroup legendText="">
              <div className={classNames(styles.visitTypeOverviewWrapper)}>
                <ResponsiveWrapper>
                  <Search
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t('searchForCompartments', 'Search for a compartment')}
                    labelText=""
                    value={searchTerm}
                  />
                  <div className={styles.compartmentListContainer}>
                    {filteredBeds.length > 0 ? (
                      <>
                        <Controller
                          control={control}
                          name="availableCompartment"
                          render={({ field }) => (
                            <div className={styles.radioButtonGroup}>
                              {filteredBeds.map((bed) => (
                                <div key={bed.bedId} className={styles.compartmentOption}>
                                  <div className={styles.radioButtonWrapper}>
                                    <RadioButton
                                      className={styles.radioButton}
                                      id={`compartment-${bed.bedId}`}
                                      labelText={bed.bedNumber}
                                      value={bed.bedId}
                                      name="availableCompartment"
                                      checked={field.value === bed.bedId}
                                      onChange={(value, name, event) => {
                                        field.onChange(bed.bedId);
                                      }}
                                    />
                                  </div>
                                  <div className={styles.compartmentTags}>
                                    {bed.bedType && (
                                      <Tag type={bed.bedType?.display === 'VIP' ? 'green' : 'blue'} size="sm">
                                        {bed.bedType?.displayName || ''}
                                      </Tag>
                                    )}
                                    <Tag type={bed.status === 'AVAILABLE' ? 'green' : 'red'} size="sm">
                                      {bed?.status || ''}
                                    </Tag>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      </>
                    ) : (
                      <Layer>
                        <Tile className={styles.emptyStateTile}>
                          <EmptyDataIllustration />
                          <p className={styles.emptyStateContent}>
                            {t('noCompartmentsFound', 'No compartments found')}
                          </p>
                        </Tile>
                      </Layer>
                    )}
                  </div>
                </ResponsiveWrapper>
                {errors.availableCompartment && (
                  <div className={styles.invalidText}>{errors.availableCompartment.message}</div>
                )}
              </div>
            </FormGroup>
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <FormGroup legendText="">
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
            </FormGroup>
          </ResponsiveWrapper>
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
                      itemToString={(item) => (item ? item.toString() : '')}
                      titleText={t('insuranceScheme', 'Insurance scheme')}
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
          <ResponsiveWrapper>
            <FormGroup legendText="">
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
            </FormGroup>
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <FormGroup legendText="">
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
            </FormGroup>
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <FormGroup legendText="">
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
                    'Is the body anextIDNo: z.sssociated with a police case? If so, can you provide the OB number?*',
                  )}
                />
              </Column>
            </FormGroup>
          </ResponsiveWrapper>
          <ResponsiveWrapper>
            <FormGroup legendText="">
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
                          className={styles.sectionField}
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
                          className={styles.sectionField}
                          placeholder={t('policeID', 'Police ID number')}
                          labelText={t('policeIDNo', 'Police ID number')}
                          invalid={!!errors.policeIDNo}
                          invalidText={errors.policeIDNo?.message}
                        />
                      )}
                    />
                  </Column>
                  <ResponsiveWrapper>
                    <ExtensionSlot
                      name="patient-chart-attachments-dashboard-slot"
                      className={styles.sectionField}
                      state={{
                        patientUuid,
                      }}
                    />{' '}
                  </ResponsiveWrapper>
                </>
              )}
            </FormGroup>
          </ResponsiveWrapper>
        </Stack>
      </div>

      <ButtonSet
        className={classNames({
          [styles.tablet]: isTablet,
          [styles.desktop]: !isTablet,
        })}>
        <Button className={styles.buttonContainer} kind="secondary" onClick={() => closeWorkspace()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.buttonContainer} disabled={isSubmitting || !isDirty} kind="primary" type="submit">
          {isSubmitting ? (
            <span className={styles.inlineLoading}>
              {t('submitting', 'Submitting' + '...')}
              <InlineLoading status="active" iconDescription="Loading" />
            </span>
          ) : (
            t('saveAndClose', 'Save & close')
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AdmitDeceasedPerson;
