import React, { useMemo, useState } from 'react';
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
  FormGroup,
  InlineLoading,
  InlineNotification,
  Layer,
  RadioButton,
  RadioButtonGroup,
  Search,
  SelectItem,
  Stack,
  Tag,
  TextInput,
  TimePicker,
  TimePickerSelect,
  Tile,
  TextArea,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ExtensionSlot,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useConfig,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './admit-deceased-person.scss';
import { createDeceasedPatientAdmitSchema } from '../../schemas';
import { getCurrentTime } from '../../utils/utils';
import { ConfigObject } from '../../config-schema';
import { DeceasedPatientHeader } from '../../deceased-patient-header/deceased-patient-header.component';
import {
  createPatientBill,
  useBillableItems,
  useCashPoint,
  useMortuaryOperation,
  usePaymentModes,
  useVisitType,
} from './admit-deceased-person.resource';
import classNames from 'classnames';
import { type MortuaryLocationResponse, type MortuaryPatient } from '../../types';

interface AdmitDeceasedPersonProps {
  closeWorkspace: () => void;
  patientData: MortuaryPatient;
  mortuaryLocation: MortuaryLocationResponse;
  mutated: () => void;
  deceasedPatientUuid?: string;
}

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
  const { time: defaultTime, period: defaultPeriod } = getCurrentTime();
  const config = useConfig<ConfigObject>();

  const { data: visitTypes, isLoading: isLoadingVisitTypes } = useVisitType();
  const { lineItems, isLoading: isLoadingLineItems } = useBillableItems();
  const { admitBody } = useMortuaryOperation(mortuaryLocation?.ward?.uuid);

  const { cashPoints } = useCashPoint();
  const cashPointUuid = cashPoints?.[0]?.uuid ?? '';
  const patientUuid = patientData?.patient?.uuid || deceasedPatientUuid;
  const { insuranceSchemes } = useConfig({ externalModuleName: '@kenyaemr/esm-billing-app' });
  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();
  const { currentProvider } = useSession();

  const {
    morgueVisitTypeUuid,
    morgueDepartmentServiceTypeUuid,
    insurancepaymentModeUuid,
    locationOfDeathTypesList,
    deathConfirmationTypes,
    deadBodyPreservationTypeUuid,
    bodyEmbalmmentTypesUuid,
  } = config;

  const deceasedPatientAdmitSchema = useMemo(() => createDeceasedPatientAdmitSchema(config), [config]);

  const getPlaceOfDeathCategory = (placeOfDeathValue: string) => {
    const placeOfDeathItem = locationOfDeathTypesList.find((item) => item.concept === placeOfDeathValue);
    return placeOfDeathItem?.label || '';
  };

  const hospitalDeathLabels = ['InPatient', 'Outpatient', 'Dead on arrival'];
  const homeDeathLabel = 'Home';
  const policeCaseDeathLabel = 'Unknown (Police case)';

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(deceasedPatientAdmitSchema),
    defaultValues: {
      dateOfAdmission: new Date(),
      placeOfDeath: '',
      dateOfDeath: new Date(),
      timeOfDeath: defaultTime,
      period: defaultPeriod,
      deathConfirmed: deathConfirmationTypes.find((type) => type.label === 'No')?.concept || '',
      deathNotificationNumber: '',
      attendingClinician: '',
      doctorsRemarks: '',
      causeOfDeath: patientData?.person?.person?.causeOfDeath?.display || '',
      autopsyPermission: deathConfirmationTypes.find((type) => type.label === 'No')?.concept || '',
      deadBodyPreservation: '',
      bodyEmbalmentType: '',
      tagNumber: '',
      obNumber: '',
      policeName: '',
      policeIDNo: '',
      visitType: morgueVisitTypeUuid,
      paymentMethod: '',
      insuranceScheme: '',
      policyNumber: '',
      services: [],
      availableCompartment: 0,
    },
  });

  const placeOfDeath = watch('placeOfDeath');
  const deathConfirmed = watch('deathConfirmed');
  const deadBodyPreservation = watch('deadBodyPreservation');
  const paymentMethodObservable = watch('paymentMethod');
  const currentVisitType = visitTypes?.find((vt) => vt.uuid === morgueVisitTypeUuid);

  const currentPlaceOfDeathLabel = getPlaceOfDeathCategory(placeOfDeath);
  const isHospitalDeath = hospitalDeathLabels.includes(currentPlaceOfDeathLabel);
  const isHomeDeath = currentPlaceOfDeathLabel === homeDeathLabel;
  const isPoliceCaseDeath = currentPlaceOfDeathLabel === policeCaseDeathLabel;

  const shouldShowDateTimeDeath = !isHomeDeath && placeOfDeath !== '';

  const bodyEmbalmmentOption = deadBodyPreservationTypeUuid.find((type) => type.label === 'Body embalment');
  const isBodyEmbalmmentSelected = deadBodyPreservation === bodyEmbalmmentOption?.concept;

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

  const onSubmit = async (data) => {
    const serviceUuids = data.services;
    const billableItems = lineItems
      .filter((item) => serviceUuids.includes(item.uuid))
      .map((item, index) => ({
        billableService: item.uuid,
        quantity: 1,
        price: item.servicePrices[0]?.price || '0.000',
        priceName: 'Default',
        priceUuid: item.servicePrices[0]?.uuid || '',
        lineItemOrder: index,
        paymentStatus: 'PENDING',
      }));

    try {
      if (isSubmitting) {
        return;
      }
      const { admissionEncounter, compartment } = await admitBody(patientUuid, data);

      if (admissionEncounter && compartment) {
        showSnackbar({
          title: t('admissionSuccess', 'Deceased Admission'),
          subtitle: t('admissionSuccessMessage', 'Patient has been admitted to the mortuary successfully'),
          kind: 'success',
        });
      }

      const billPayload = {
        lineItems: billableItems,
        cashPoint: cashPointUuid,
        patient: patientUuid,
        status: 'PENDING',
        payments: [],
      };

      await createPatientBill(billPayload);
      showSnackbar({
        title: t('admissionBillSuccess', 'Bill creation'),
        subtitle: t('admissionBillSuccessMessage', "Patient's bill has been created successfully"),
        kind: 'success',
      });
      mutated();
      closeWorkspace();
    } catch (error) {
      showSnackbar({
        title: t('error', 'Error'),
        subtitle: error?.message || t('unknownError', 'An unknown error occurred'),
        kind: 'error',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContainer}>
        <Stack gap={3}>
          <DeceasedPatientHeader patientData={patientData} />

          <ResponsiveWrapper>
            <FormGroup legendText="">
              <Controller
                control={control}
                name="visitType"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="visit-type"
                    labelText={t('visitType', 'Visit type *')}
                    value={currentVisitType?.display || ''}
                    readOnly
                    invalid={!!errors.visitType}
                    invalidText={errors.visitType?.message}
                  />
                )}
              />
            </FormGroup>
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <FormGroup legendText={t('assignCompartment', 'Assign compartment *')}>
              <Search
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchForCompartments', 'Search for a compartment')}
                value={searchTerm}
                labelText=""
              />
              <div className={styles.compartmentListContainer}>
                {filteredBeds.length > 0 ? (
                  <Controller
                    control={control}
                    name="availableCompartment"
                    render={({ field }) => (
                      <div className={styles.radioButtonGroup}>
                        {filteredBeds.map((bed) => (
                          <div key={bed.bedId} className={styles.compartmentOption}>
                            <RadioButton
                              id={`compartment-${bed.bedId}`}
                              labelText={bed.bedNumber}
                              value={bed.bedId}
                              checked={field.value === bed.bedId}
                              onChange={() => field.onChange(bed.bedId)}
                            />
                            <div className={styles.compartmentTags}>
                              <Tag type={bed.bedType?.display === 'VIP' ? 'green' : 'blue'} size="sm">
                                {bed.bedType?.displayName || ''}
                              </Tag>
                              <Tag type={bed.status === 'AVAILABLE' ? 'green' : 'red'} size="sm">
                                {bed?.status || ''}
                              </Tag>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                ) : (
                  <Layer>
                    <Tile className={styles.emptyStateTile}>
                      <p className={styles.emptyStateContent}>{t('noCompartmentsFound', 'No compartments found')}</p>
                    </Tile>
                  </Layer>
                )}
              </div>
              {errors.availableCompartment && (
                <p className={styles.invalidText}>{errors.availableCompartment.message}</p>
              )}
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
                        titleText={t('selectPaymentMethod', 'Select payment method *')}
                        label={t('selectPaymentMethod', 'Select payment method *')}
                        invalid={!!errors.paymentMethod}
                        invalidText={errors.paymentMethod?.message}
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
                      titleText={t('insuranceScheme', 'Insurance scheme *')}
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
                      {...field}
                      className={styles.sectionField}
                      id="policy-number"
                      type="text"
                      labelText={t('policyNumber', 'Policy number *')}
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
                          titleText={t('searchServices', 'Search services *')}
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
            <Controller
              name="placeOfDeath"
              control={control}
              render={({ field }) => (
                <ComboBox
                  id="placeOfDeath"
                  items={locationOfDeathTypesList}
                  itemToString={(item) => item?.label || ''}
                  titleText={t('placeOfDeath', 'Place of Death *')}
                  placeholder={t('selectPlaceOfDeath', 'Select place of death')}
                  invalid={!!errors.placeOfDeath}
                  invalidText={errors.placeOfDeath?.message}
                  selectedItem={locationOfDeathTypesList.find((item) => item.concept === field.value) || null}
                  onChange={({ selectedItem }) => field.onChange(selectedItem?.concept || '')}
                />
              )}
            />
          </ResponsiveWrapper>

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
                      labelText={t('tagNumber', 'Tag Number *')}
                      placeholder={t('enterTagNumber', 'Enter tag number')}
                      invalid={!!errors.tagNumber}
                      invalidText={errors.tagNumber?.message}
                    />
                  )}
                />
              </Column>
            </FormGroup>
          </ResponsiveWrapper>

          {shouldShowDateTimeDeath && (
            <>
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
                            labelText={t('dateOfAdmission', 'Date of admission *')}
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
                                labelText={t('timeAdmission', 'Time of admission *')}
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
            </>
          )}

          <ResponsiveWrapper>
            <FormGroup legendText={t('deathConfirmation', 'Death confirmed *')}>
              <Controller
                name="deathConfirmed"
                control={control}
                render={({ field }) => {
                  const yesOption = deathConfirmationTypes.find((type) => type.label === 'Yes');
                  const noOption = deathConfirmationTypes.find((type) => type.label === 'No');

                  return (
                    <RadioButtonGroup
                      name="deathConfirmed"
                      orientation="vertical"
                      value={field.value}
                      onChange={field.onChange}
                      invalid={!!errors.deathConfirmed}
                      invalidText={errors.deathConfirmed?.message}>
                      <RadioButton
                        className={styles.radioButton}
                        value={yesOption?.concept}
                        labelText={t('yes', 'Yes')}
                      />
                      <RadioButton value={noOption?.concept} labelText={t('no', 'No')} />
                    </RadioButtonGroup>
                  );
                }}
              />
            </FormGroup>
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <FormGroup legendText="">
              <Column>
                <Controller
                  name="deathNotificationNumber"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="deathNotificationNumber"
                      labelText={t('deathNotificationNumber', 'Death Notification Number')}
                      invalid={!!errors.deathNotificationNumber}
                      invalidText={errors.deathNotificationNumber?.message}
                    />
                  )}
                />
              </Column>
            </FormGroup>
          </ResponsiveWrapper>

          {isHospitalDeath && (
            <>
              <ResponsiveWrapper>
                <FormGroup legendText="">
                  <Column>
                    <Controller
                      name="attendingClinician"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          id="attendingClinician"
                          labelText={t('attendingClinician', 'Attending clinician/Doctor *')}
                          invalid={!!errors.attendingClinician}
                          invalidText={errors.attendingClinician?.message}
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
                      name="doctorsRemarks"
                      control={control}
                      render={({ field }) => (
                        <TextArea
                          {...field}
                          id="doctorsRemarks"
                          labelText={t('doctorsRemarks', "Doctor's remarks *")}
                          invalid={!!errors.doctorsRemarks}
                          invalidText={errors.doctorsRemarks?.message}
                        />
                      )}
                    />
                  </Column>
                </FormGroup>
              </ResponsiveWrapper>
            </>
          )}

          <ResponsiveWrapper>
            <FormGroup legendText="">
              <Column>
                <Controller
                  name="causeOfDeath"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      id="causeOfDeath"
                      labelText={t('causeOfDeath', 'Cause of Death (if known)')}
                      invalid={!!errors.causeOfDeath}
                      invalidText={errors.causeOfDeath?.message}
                    />
                  )}
                />
              </Column>
            </FormGroup>
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <FormGroup legendText={t('autopsyPermission', 'Autopsy Permission (if applicable) *')}>
              <Controller
                name="autopsyPermission"
                control={control}
                render={({ field }) => {
                  const yesOption = deathConfirmationTypes.find((type) => type.label === 'Yes');
                  const noOption = deathConfirmationTypes.find((type) => type.label === 'No');

                  return (
                    <RadioButtonGroup
                      name="autopsyPermission"
                      orientation="vertical"
                      value={field.value}
                      onChange={field.onChange}
                      invalid={!!errors.autopsyPermission}
                      invalidText={errors.autopsyPermission?.message}>
                      <RadioButton
                        className={styles.radioButton}
                        value={yesOption?.concept}
                        labelText={t('yes', 'Yes')}
                      />
                      <RadioButton className={styles.radioButton} value={noOption?.concept} labelText={t('no', 'No')} />
                    </RadioButtonGroup>
                  );
                }}
              />
            </FormGroup>
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <FormGroup legendText={t('deadBodyPreservation', 'Dead Body preservation')}>
              <Controller
                name="deadBodyPreservation"
                control={control}
                render={({ field }) => (
                  <RadioButtonGroup
                    name="deadBodyPreservation"
                    orientation="vertical"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.deadBodyPreservation}
                    invalidText={errors.deadBodyPreservation?.message}>
                    {deadBodyPreservationTypeUuid.map((preservationType) => (
                      <RadioButton
                        key={preservationType.concept}
                        value={preservationType.concept}
                        className={styles.radioButton}
                        labelText={t(preservationType.label.toLowerCase().replace(' ', ''), preservationType.label)}
                      />
                    ))}
                  </RadioButtonGroup>
                )}
              />
            </FormGroup>
          </ResponsiveWrapper>

          {isBodyEmbalmmentSelected && (
            <ResponsiveWrapper>
              <FormGroup legendText={t('bodyEmbalmentType', 'Body embalment types *')}>
                <Controller
                  name="bodyEmbalmentType"
                  control={control}
                  render={({ field }) => (
                    <RadioButtonGroup
                      name="bodyEmbalmentType"
                      orientation="vertical"
                      value={field.value}
                      onChange={field.onChange}
                      invalid={!!errors.bodyEmbalmentType}
                      invalidText={errors.bodyEmbalmentType?.message}>
                      {bodyEmbalmmentTypesUuid.map((embalmmentType) => (
                        <RadioButton
                          key={embalmmentType.concept}
                          className={styles.radioButton}
                          value={embalmmentType.concept}
                          labelText={t(embalmmentType.label.toLowerCase(), embalmmentType.label)}
                        />
                      ))}
                    </RadioButtonGroup>
                  )}
                />
              </FormGroup>
            </ResponsiveWrapper>
          )}

          {isPoliceCaseDeath && (
            <>
              <ResponsiveWrapper>
                <FormGroup legendText="">
                  <Column>
                    <Controller
                      name="policeName"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          id="policeName"
                          labelText={t('policeName', 'Police name *')}
                          invalid={!!errors.policeName}
                          invalidText={errors.policeName?.message}
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
                      name="policeIDNo"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          id="policeIDNo"
                          labelText={t('policeIDNo', 'Police ID number *')}
                          invalid={!!errors.policeIDNo}
                          invalidText={errors.policeIDNo?.message}
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
                      name="obNumber"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          id="obNumber"
                          labelText={t('obNumber', 'OB Number *')}
                          placeholder={t('enterObNumber', 'Enter OB number')}
                          invalid={!!errors.obNumber}
                          invalidText={errors.obNumber?.message}
                        />
                      )}
                    />
                  </Column>
                </FormGroup>
              </ResponsiveWrapper>
            </>
          )}
          <FormGroup
            className={styles.supportingDocuments}
            legendText={t('supportingDocuments', 'Supporting Documents')}>
            <ResponsiveWrapper>
              <ExtensionSlot name="patient-chart-attachments-dashboard-slot" state={{ patientUuid }} />
            </ResponsiveWrapper>
          </FormGroup>
        </Stack>
      </div>

      <ButtonSet className={classNames(styles.buttonSet, { [styles.tablet]: isTablet })}>
        <Button kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? (
            <InlineLoading description={t('submitting', 'Submitting...')} />
          ) : (
            t('saveAndClose', 'Save & close')
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AdmitDeceasedPerson;
