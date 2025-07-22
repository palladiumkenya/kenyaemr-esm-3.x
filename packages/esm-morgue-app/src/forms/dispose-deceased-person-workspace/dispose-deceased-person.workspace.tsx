import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  InlineLoading,
  InlineNotification,
  SelectItem,
  Stack,
  TextInput,
  TimePicker,
  TimePickerSelect,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ExtensionSlot,
  fhirBaseUrl,
  ResponsiveWrapper,
  restBaseUrl,
  setCurrentVisit,
  showSnackbar,
  useConfig,
  useLayoutType,
  useVisit,
} from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate as mutateSWR } from 'swr';
import { z } from 'zod';
import styles from './dispose-deceased-person.scss';
import DeceasedInfo from '../../deceased-patient-header/deceasedInfo/deceased-info.component';
import { PatientInfo } from '../../types';
import {
  useBlockDischargeWithPendingBills,
  usePersonAttributes,
} from '../discharge-deceased-person-workspace/discharge-body.resource';
import { ConfigObject } from '../../config-schema';
import { getCurrentTime } from '../../utils/utils';
import { disposeSchema } from '../../schemas';
import { useAwaitingQueuePatients, useVisitQueueEntry } from '../../home/home.resource';
import classNames from 'classnames';
import { useMortuaryOperation } from '../admit-deceased-person-workspace/admit-deceased-person.resource';

interface DisposeFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
  bedId: number;
  mutate: () => void;
}

type DisposeFormValues = z.infer<typeof disposeSchema>;

const DisposeForm: React.FC<DisposeFormProps> = ({ closeWorkspace, patientUuid, bedId, mutate }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { activeVisit, currentVisitIsRetrospective } = useVisit(patientUuid);
  const { queueEntry } = useVisitQueueEntry(patientUuid, activeVisit?.uuid);

  const { disposeBody, isLoadingEmrConfiguration } = useMortuaryOperation();

  const {
    createOrUpdatePersonAttribute,
    personAttributes,
    isLoading: isLoadingAttributes,
  } = usePersonAttributes(patientUuid);

  const { isDischargeBlocked, blockingMessage, isLoadingBills } = useBlockDischargeWithPendingBills({
    patientUuid,
    actionType: 'dispose',
  });

  const { nextOfKinNameUuid, nextOfKinRelationshipUuid, nextOfKinPhoneUuid, nextOfKinAddressUuid } =
    useConfig<ConfigObject>();

  const { time: defaultTime, period: defaultPeriod } = getCurrentTime();

  const getAttributeValue = useCallback(
    (attributeTypeUuid: string) => {
      if (!personAttributes || !Array.isArray(personAttributes)) {
        return '';
      }
      const attribute = personAttributes.find((attr) => attr.attributeType.uuid === attributeTypeUuid);
      return attribute ? attribute.value : '';
    },
    [personAttributes],
  );

  const getExistingAttributeUuid = useCallback(
    (attributeTypeUuid: string) => {
      if (!personAttributes || !Array.isArray(personAttributes)) {
        return null;
      }
      const attribute = personAttributes.find((attr) => attr.attributeType.uuid === attributeTypeUuid);
      return attribute ? attribute.uuid : null;
    },
    [personAttributes],
  );

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
  } = useForm<DisposeFormValues>({
    resolver: zodResolver(disposeSchema),
    defaultValues: {
      dateOfDischarge: new Date(),
      timeOfDischarge: defaultTime,
      period: defaultPeriod,
      serialNumber: '',
      courtOrderCaseNumber: '',
      nextOfKinNames: '',
      relationshipType: '',
      nextOfKinContact: '',
      nextOfKinAddress: '',
    },
  });

  useEffect(() => {
    if (Array.isArray(personAttributes) && personAttributes.length > 0) {
      const initialValues = {
        nextOfKinNames: getAttributeValue(nextOfKinNameUuid),
        relationshipType: getAttributeValue(nextOfKinRelationshipUuid),
        nextOfKinContact: getAttributeValue(nextOfKinPhoneUuid),
        nextOfKinAddress: getAttributeValue(nextOfKinAddressUuid),
      };

      Object.entries(initialValues).forEach(([field, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          setValue(field as keyof DisposeFormValues, value);
        }
      });
    }
  }, [
    personAttributes,
    setValue,
    getAttributeValue,
    nextOfKinNameUuid,
    nextOfKinRelationshipUuid,
    nextOfKinPhoneUuid,
    nextOfKinAddressUuid,
  ]);

  const onSubmit = async (data: DisposeFormValues) => {
    setSubmissionError(null);

    if (currentVisitIsRetrospective) {
      setCurrentVisit(null, null);
      closeWorkspace();
      return;
    }

    try {
      await disposeBody(activeVisit, queueEntry, bedId, data);

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
          uuid: nextOfKinAddressUuid,
          value: data.nextOfKinAddress,
          existingUuid: getExistingAttributeUuid(nextOfKinAddressUuid),
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
        title: t('disposedDeceasedPatient', 'Deceased patient disposed'),
        subtitle: t('deceasedPatientDisposedSuccessfully', 'Deceased patient has been disposed successfully'),
        kind: 'success',
        isLowContrast: true,
      });

      mutate();
      closeWorkspace();
    } catch (error) {
      let errorMessage = t('disposeUnknownError', 'An unknown error occurred');
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.responseBody?.error?.message) {
        errorMessage = error.responseBody.error.message.replace(/\[|\]/g, '');
      } else if (error?.responseBody?.error?.globalErrors) {
        errorMessage = error.responseBody.error.globalErrors[0]?.message || errorMessage;
      }

      setSubmissionError(errorMessage);
      showSnackbar({
        title: t('disposedError', 'Dispose Error'),
        subtitle: errorMessage,
        kind: 'error',
        isLowContrast: true,
      });
    }
  };

  if (isLoadingEmrConfiguration || isLoadingAttributes || !activeVisit) {
    return <InlineLoading status="active" iconDescription="Loading" description={t('loading', 'Loading...')} />;
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContainer}>
        {isLoadingBills && (
          <InlineLoading
            status="active"
            iconDescription="Loading"
            description={t('loadingBills', 'Loading bills...')}
          />
        )}

        {isDischargeBlocked && (
          <InlineNotification
            kind="warning"
            title={t('warningMsg', 'Warning')}
            subtitle={blockingMessage}
            lowContrast={true}
            className={styles.blockingNotification}
          />
        )}

        {submissionError && (
          <InlineNotification
            kind="error"
            title={t('error', 'Error')}
            subtitle={submissionError}
            lowContrast={true}
            className={styles.errorNotification}
          />
        )}

        <Stack gap={3}>
          <DeceasedInfo patientUuid={patientUuid} />

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
                        labelText={t('dateOfDischarge', 'Date of discharge*')}
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
                          labelText={t('timeOfDischarge', 'Time of discharge*')}
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

            <Column className={styles.fieldColumn}>
              <Controller
                name="serialNumber"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="serialNumber"
                    type="text"
                    className={styles.sectionField}
                    placeholder={t('serialNumber', 'Serial number')}
                    labelText={t('serialNumber', 'Serial number*')}
                    invalid={!!errors.serialNumber}
                    invalidText={errors.serialNumber?.message}
                  />
                )}
              />
            </Column>

            <Column className={styles.fieldColumn}>
              <Controller
                name="courtOrderCaseNumber"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="courtOrderCaseNumber"
                    type="text"
                    className={styles.sectionField}
                    placeholder={t('courtOrderCaseNumber', 'Court order case number')}
                    labelText={t('courtOrderCaseNumber', 'Court order case number')}
                    invalid={!!errors.courtOrderCaseNumber}
                    invalidText={errors.courtOrderCaseNumber?.message}
                  />
                )}
              />
            </Column>

            <Column className={styles.fieldColumn}>
              <Controller
                name="nextOfKinNames"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="nextOfKinNames"
                    type="text"
                    className={styles.sectionField}
                    placeholder={t('nextOfKinNames', 'Next of kin names')}
                    labelText={t('nextOfKinNames', 'Next of kin names')}
                    invalid={!!errors.nextOfKinNames}
                    invalidText={errors.nextOfKinNames?.message}
                  />
                )}
              />
            </Column>

            <Column className={styles.fieldColumn}>
              <Controller
                name="relationshipType"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="relationshipType"
                    type="text"
                    className={styles.sectionField}
                    placeholder={t('relationshipType', 'Relationship')}
                    labelText={t('relationshipType', 'Relationship')}
                    invalid={!!errors.relationshipType}
                    invalidText={errors.relationshipType?.message}
                  />
                )}
              />
            </Column>

            <Column className={styles.fieldColumn}>
              <Controller
                name="nextOfKinContact"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="nextOfKinContact"
                    type="text"
                    className={styles.sectionField}
                    placeholder={t('nextOfKinContact', 'Next of kin contact')}
                    labelText={t('nextOfKinContact', 'Next of kin contact')}
                    invalid={!!errors.nextOfKinContact}
                    invalidText={errors.nextOfKinContact?.message}
                  />
                )}
              />
            </Column>

            <Column className={styles.fieldColumn}>
              <Controller
                name="nextOfKinAddress"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="nextOfKinAddress"
                    type="text"
                    className={styles.sectionField}
                    placeholder={t('nextOfKinAddress', 'Next of kin address')}
                    labelText={t('nextOfKinAddress', 'Next of kin address')}
                    invalid={!!errors.nextOfKinAddress}
                    invalidText={errors.nextOfKinAddress?.message}
                  />
                )}
              />
            </Column>
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <Column>
              <ExtensionSlot
                name="patient-chart-attachments-dashboard-slot"
                className={styles.sectionField}
                state={{
                  patientUuid,
                }}
              />
            </Column>
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
        <Button
          className={styles.buttonContainer}
          disabled={isSubmitting || !isDirty || isDischargeBlocked || isLoadingBills}
          kind="primary"
          type="submit">
          {isSubmitting ? (
            <span className={styles.inlineLoading}>
              {t('submitting', 'Submitting...')}
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

export default DisposeForm;
