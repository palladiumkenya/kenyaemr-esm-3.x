import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  SelectItem,
  Stack,
  TextInput,
  TimePicker,
  TimePickerSelect,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ExtensionSlot,
  ResponsiveWrapper,
  showSnackbar,
  useConfig,
  useLayoutType,
  useVisit,
  usePatient,
  restBaseUrl,
  fhirBaseUrl,
  setCurrentVisit, // Add this import
} from '@openmrs/esm-framework';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './discharge-body.scss';
import DeceasedInfo from '../../deceased-patient-header/deceasedInfo/deceased-info.component';
import { useBlockDischargeWithPendingBills, usePersonAttributes } from './discharge-body.resource';
import { getCurrentTime } from '../../utils/utils';
import { dischargeFormSchema, DischargeType } from '../../schemas';
import { useVisitQueueEntry } from '../../home/home.resource';
import classNames from 'classnames';
import { useMortuaryOperation } from '../admit-deceased-person-workspace/admit-deceased-person.resource';
import { ConfigObject } from '../../config-schema';
import { PatientInfo } from '../../types';
import { mutate as mutateSWR } from 'swr';
interface DischargeFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
  bedId: number;
  mutate: () => void;
}

const DischargeForm: React.FC<DischargeFormProps> = ({ closeWorkspace, patientUuid, bedId, mutate }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { activeVisit, currentVisitIsRetrospective } = useVisit(patientUuid);
  const { queueEntry } = useVisitQueueEntry(patientUuid, activeVisit?.uuid);
  const { dischargeBody } = useMortuaryOperation();
  const { patient } = usePatient(patientUuid);

  const {
    createOrUpdatePersonAttribute,
    personAttributes,
    isLoading: isLoadingAttributes,
  } = usePersonAttributes(patientUuid);
  const { isDischargeBlocked, blockingMessage, isLoadingBills } = useBlockDischargeWithPendingBills({
    patientUuid,
    actionType: 'discharge',
  });

  const { nextOfKinNameUuid, nextOfKinRelationshipUuid, nextOfKinPhoneUuid, nextOfKinNationalIdUuid } =
    useConfig<ConfigObject>();
  const { time: defaultTime, period: defaultPeriod } = getCurrentTime();

  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(dischargeFormSchema),
    defaultValues: {
      dischargeType: 'discharge',
      dateOfDischarge: new Date(),
      timeOfDischarge: defaultTime,
      period: defaultPeriod,
      burialPermitNumber: '',
      dischargeArea: '',
      receivingArea: '',
      reasonForTransfer: '',
      nextOfKinNames: '',
      relationshipType: '',
      nextOfKinContact: '',
      nextOfKinNationalId: '',
      serialNumber: '',
      courtOrderCaseNumber: '',
    },
  });

  const selectedDischargeType = watch('dischargeType');

  useEffect(() => {
    if (personAttributes?.length) {
      setValue('nextOfKinNames', getAttributeValue(nextOfKinNameUuid));
      setValue('relationshipType', getAttributeValue(nextOfKinRelationshipUuid));
      setValue('nextOfKinContact', getAttributeValue(nextOfKinPhoneUuid));
      setValue('nextOfKinNationalId', getAttributeValue(nextOfKinNationalIdUuid));
    }
  }, [
    personAttributes,
    setValue,
    nextOfKinNameUuid,
    nextOfKinRelationshipUuid,
    nextOfKinPhoneUuid,
    nextOfKinNationalIdUuid,
  ]);

  const getAttributeValue = useCallback(
    (attributeTypeUuid: string) =>
      personAttributes?.find((attr) => attr.attributeType.uuid === attributeTypeUuid)?.value || '',
    [personAttributes],
  );

  const getExistingAttributeUuid = useCallback(
    (attributeTypeUuid: string) =>
      personAttributes?.find((attr) => attr.attributeType.uuid === attributeTypeUuid)?.uuid || null,
    [personAttributes],
  );

  const onSubmit = async (data) => {
    setSubmissionError(null);

    if (currentVisitIsRetrospective) {
      setCurrentVisit(null, null);
      closeWorkspace();
      return;
    }

    try {
      await dischargeBody(activeVisit, queueEntry, bedId, data);

      const attributeUpdates = [
        {
          uuid: nextOfKinNameUuid,
          value: data.nextOfKinNames,
          existingUuid: getExistingAttributeUuid(nextOfKinNameUuid),
        },
        {
          uuid: nextOfKinRelationshipUuid,
          value: data.relationshipType,
          existingUuid: getExistingAttributeUuid(nextOfKinRelationshipUuid),
        },
        {
          uuid: nextOfKinPhoneUuid,
          value: data.nextOfKinContact,
          existingUuid: getExistingAttributeUuid(nextOfKinPhoneUuid),
        },
        {
          uuid: nextOfKinNationalIdUuid,
          value: data.nextOfKinNationalId,
          existingUuid: getExistingAttributeUuid(nextOfKinNationalIdUuid),
        },
      ].filter((attr) => attr.value !== undefined && attr.value !== null && attr.value !== '');

      const patientInfo: PatientInfo = {
        uuid: activeVisit.patient.uuid,
        attributes: personAttributes || [],
      };

      for (const attr of attributeUpdates) {
        try {
          const attributeData: any = {
            attributeType: attr.uuid,
            value: attr.value,
          };

          if (attr.existingUuid) {
            attributeData.uuid = attr.existingUuid;
          }

          await createOrUpdatePersonAttribute(patientUuid, attributeData, patientInfo);
        } catch (error) {
          showSnackbar({
            title: t('errorUpdatingAttribute', 'Error Updating Attribute'),
            subtitle: t('errorUpdatingAttributeDescription', 'An error occurred while updating the attribute'),
            kind: 'error',
            isLowContrast: true,
          });
        }
      }

      await Promise.all([
        mutateSWR((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/visit`)),
        mutateSWR((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/patient`)),
        mutateSWR((key) => typeof key === 'string' && key.startsWith(`${fhirBaseUrl}/Encounter`)),
      ]);

      showSnackbar({
        title: t('dischargeDeceasedPatient', 'Deceased patient discharged'),
        subtitle: t('deceasedPatientDischargedSuccessfully', 'Deceased patient has been discharged successfully'),
        kind: 'success',
        isLowContrast: true,
      });

      mutate();
      closeWorkspace();
    } catch (error) {
      let errorMessage = t('dischargeUnknownError', 'An unknown error occurred');
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.responseBody?.error?.message) {
        errorMessage = error.responseBody.error.message.replace(/\[|\]/g, '');
      } else if (error?.responseBody?.error?.globalErrors) {
        errorMessage = error.responseBody.error.globalErrors[0]?.message || errorMessage;
      }

      setSubmissionError(errorMessage);
      showSnackbar({
        title: t('dischargeError', 'Discharge Error'),
        subtitle: errorMessage,
        kind: 'error',
        isLowContrast: true,
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContainer}>
        {isLoadingBills && <InlineLoading description={t('loadingBills', 'Loading bills...')} />}
        {isDischargeBlocked && (
          <InlineNotification kind="warning" title={t('warning', 'Warning')} subtitle={blockingMessage} lowContrast />
        )}
        {submissionError && (
          <InlineNotification kind="error" title={t('error', 'Error')} subtitle={submissionError} lowContrast />
        )}

        <Stack gap={3}>
          <DeceasedInfo patientUuid={patientUuid} />

          <FormGroup legendText={t('dischargeType', 'Discharge type')}>
            <Controller
              name="dischargeType"
              control={control}
              render={({ field }) => (
                <RadioButtonGroup
                  name="dischargeType"
                  orientation="vertical"
                  value={field.value}
                  defaultSelected={field.value}
                  onChange={field.onChange}>
                  <RadioButton
                    className={styles.radioButton}
                    value="discharge"
                    labelText={t('discharge', 'Discharge')}
                  />
                  <RadioButton className={styles.radioButton} value="transfer" labelText={t('transfer', 'Transfer')} />
                  <RadioButton className={styles.radioButton} value="dispose" labelText={t('dispose', 'Dispose')} />
                </RadioButtonGroup>
              )}
            />
          </FormGroup>

          {(selectedDischargeType === 'discharge' || selectedDischargeType === 'transfer') && (
            <ResponsiveWrapper>
              <div className={styles.dateTimePickerContainer}>
                <Column>
                  <Controller
                    name="dateOfDischarge"
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
                          {...field}
                          id="date-of-discharge"
                          placeholder="yyyy-mm-dd"
                          labelText={
                            selectedDischargeType === 'discharge'
                              ? t('dateOfDischarge', 'Date of discharge*')
                              : t('dateOfTransfer', 'Date of transfer*')
                          }
                          invalid={!!errors.dateOfDischarge}
                          invalidText={errors.dateOfDischarge?.message}
                        />
                      </DatePicker>
                    )}
                  />
                </Column>

                <Column>
                  <div className={styles.dateTimeSection}>
                    <ResponsiveWrapper>
                      <Controller
                        name="timeOfDischarge"
                        control={control}
                        render={({ field }) => (
                          <TimePicker
                            {...field}
                            id="time-of-discharge-picker"
                            labelText={
                              selectedDischargeType === 'discharge'
                                ? t('timeOfDischarge', 'Time of discharge*')
                                : t('timeOfTransfer', 'Time of transfer*')
                            }
                            className={styles.formAdmissionTimepicker}
                            invalid={!!errors.timeOfDischarge}
                            invalidText={errors.timeOfDischarge?.message}
                          />
                        )}
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
              </div>
            </ResponsiveWrapper>
          )}

          <ResponsiveWrapper>
            <Column>
              <Controller
                name="burialPermitNumber"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="burialPermitNumber"
                    labelText={t('permitSerialNumber', 'Permit serial number*')}
                    invalid={!!errors.burialPermitNumber}
                    invalidText={errors.burialPermitNumber?.message}
                  />
                )}
              />
            </Column>
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <Column>
              <Controller
                name="dischargeArea"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="dischargeArea"
                    labelText={t('dischargeArea', 'Discharge Area*')}
                    invalid={!!errors.dischargeArea}
                    invalidText={errors.dischargeArea?.message}
                  />
                )}
              />
            </Column>
          </ResponsiveWrapper>

          {selectedDischargeType === 'transfer' && (
            <>
              <ResponsiveWrapper>
                <Column>
                  <Controller
                    name="receivingArea"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        id="receivingArea"
                        labelText={t('receivingArea', 'Receiving mortuary*')}
                        invalid={!!errors.receivingArea}
                        invalidText={errors.receivingArea?.message}
                      />
                    )}
                  />
                </Column>
              </ResponsiveWrapper>
              <ResponsiveWrapper>
                <Column>
                  <Controller
                    name="reasonForTransfer"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        id="reasonForTransfer"
                        labelText={t('reasonForTransfer', 'Reason for transfer*')}
                        invalid={!!errors.reasonForTransfer}
                        invalidText={errors.reasonForTransfer?.message}
                      />
                    )}
                  />
                </Column>
              </ResponsiveWrapper>
            </>
          )}

          {selectedDischargeType === 'dispose' && (
            <>
              <ResponsiveWrapper>
                <Column>
                  <Controller
                    name="serialNumber"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        id="serialNumber"
                        labelText={t('serialNumber', 'Serial Number*')}
                        invalid={!!errors.serialNumber}
                        invalidText={errors.serialNumber?.message}
                      />
                    )}
                  />
                </Column>
              </ResponsiveWrapper>
              <ResponsiveWrapper>
                <Column>
                  <Controller
                    name="courtOrderCaseNumber"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        id="courtOrderCaseNumber"
                        labelText={t('courtOrderCaseNumber', 'Court Order Case Number*')}
                        invalid={!!errors.courtOrderCaseNumber}
                        invalidText={errors.courtOrderCaseNumber?.message}
                      />
                    )}
                  />
                </Column>
              </ResponsiveWrapper>
            </>
          )}

          <FormGroup legendText={t('nextOfKinInformation', 'Next of Kin Information')}>
            <Stack gap={3}>
              <Column>
                <Controller
                  name="nextOfKinNames"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="nextOfKinNames"
                      labelText={t('nextOfKinNames', 'Next of kin names*')}
                      invalid={!!errors.nextOfKinNames}
                      invalidText={errors.nextOfKinNames?.message}
                    />
                  )}
                />
              </Column>
              <Column>
                <Controller
                  name="relationshipType"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="relationshipType"
                      labelText={t('relationshipType', 'Relationship*')}
                      invalid={!!errors.relationshipType}
                      invalidText={errors.relationshipType?.message}
                    />
                  )}
                />
              </Column>
              <Column>
                <Controller
                  name="nextOfKinContact"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="nextOfKinContact"
                      labelText={t('nextOfKinContact', 'Next of kin contact*')}
                      invalid={!!errors.nextOfKinContact}
                      invalidText={errors.nextOfKinContact?.message}
                    />
                  )}
                />
              </Column>
              <Column>
                <Controller
                  name="nextOfKinNationalId"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="nextOfKinNationalId"
                      labelText={t('nextOfKinNationalId', 'Next of kin National ID*')}
                      invalid={!!errors.nextOfKinNationalId}
                      invalidText={errors.nextOfKinNationalId?.message}
                    />
                  )}
                />
              </Column>
            </Stack>
          </FormGroup>

          <ExtensionSlot name="patient-chart-attachments-dashboard-slot" state={{ patientUuid }} />
        </Stack>
      </div>

      <ButtonSet className={classNames(styles.buttonSet, { [styles.tablet]: isTablet })}>
        <Button kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="primary"
          type="submit"
          disabled={isSubmitting || !isDirty || isDischargeBlocked || isLoadingBills || !patient}>
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

export default DischargeForm;
