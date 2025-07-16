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
import React, { useCallback, useEffect } from 'react';
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
  personUuid: string;
  bedId: number;
  mutate: () => void;
}

type DisposeFormValues = z.infer<typeof disposeSchema>;

const DisposeForm: React.FC<DisposeFormProps> = ({ closeWorkspace, patientUuid, bedId, personUuid, mutate }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { activeVisit, currentVisitIsRetrospective } = useVisit(patientUuid);
  const { queueEntry } = useVisitQueueEntry(patientUuid, activeVisit?.uuid);
  const { disposeBody, isLoadingEmrConfiguration } = useMortuaryOperation();
  const { createOrUpdatePersonAttribute, personAttributes } = usePersonAttributes(personUuid);
  const { mutateAll, mutateAwaitingQueuePatients } = useAwaitingQueuePatients();
  const { isDischargeBlocked, blockingMessage, isLoadingBills } = useBlockDischargeWithPendingBills({
    patientUuid,
  });
  const { time: defaultTime, period: defaultPeriod } = getCurrentTime();

  const { nextOfKinNameUuid, nextOfKinRelationshipUuid, nextOfKinPhoneUuid, nextOfKinAddressUuid } =
    useConfig<ConfigObject>();

  const getAttributeValue = useCallback(
    (attributeTypeUuid: string) => {
      if (!personAttributes) {
        return '';
      }
      const attributes = Array.isArray(personAttributes) ? personAttributes : [];
      const attribute = attributes.find((attr) => attr.attributeType.uuid === attributeTypeUuid);
      return attribute ? attribute.value : '';
    },
    [personAttributes],
  );

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
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
      setValue('nextOfKinNames', getAttributeValue(nextOfKinNameUuid));
      setValue('relationshipType', getAttributeValue(nextOfKinRelationshipUuid));
      setValue('nextOfKinContact', getAttributeValue(nextOfKinPhoneUuid));
      setValue('nextOfKinAddress', getAttributeValue(nextOfKinAddressUuid));
    }
  }, [
    personAttributes,
    getAttributeValue,
    nextOfKinNameUuid,
    nextOfKinRelationshipUuid,
    nextOfKinPhoneUuid,
    nextOfKinAddressUuid,
    setValue,
  ]);

  const onSubmit = async (data: DisposeFormValues) => {
    if (currentVisitIsRetrospective) {
      setCurrentVisit(null, null);
      closeWorkspace();
      return;
    }

    try {
      const nextOfKinAttributes = [
        { attributeType: nextOfKinNameUuid, value: data.nextOfKinNames },
        { attributeType: nextOfKinRelationshipUuid, value: data.relationshipType },
        { attributeType: nextOfKinPhoneUuid, value: data.nextOfKinContact },
        { attributeType: nextOfKinAddressUuid, value: data.nextOfKinAddress },
      ];

      const patientInfo: PatientInfo = {
        uuid: activeVisit.patient.uuid,
        attributes: (activeVisit?.patient?.person?.attributes || []).map((attr) => ({
          uuid: attr.uuid,
          display: attr.display || '',
        })),
      };

      for (const attribute of nextOfKinAttributes) {
        try {
          await createOrUpdatePersonAttribute(patientUuid, attribute, patientInfo);
        } catch (attributeError) {
          showSnackbar({
            title: t('errorDisposingPatient', 'Error disposing patient'),
            subtitle: attributeError?.message || t('unknownError', 'Unknown error occurred'),
            kind: 'error',
            isLowContrast: true,
          });
        }
      }

      await disposeBody(activeVisit, queueEntry, bedId, data);

      showSnackbar({
        title: t('disposedDeceasedPatient', 'Deceased patient disposed'),
        subtitle: t('deceasedPatientDisposedSuccessfully', 'Deceased patient has been disposed successfully'),
        kind: 'success',
        isLowContrast: true,
      });

      mutateSWR((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/visit`));
      mutateSWR((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/patient`));
      mutateSWR((key) => typeof key === 'string' && key.startsWith(`${fhirBaseUrl}/Encounter`));
      mutateAwaitingQueuePatients();
      mutateAll();
      mutate();
      closeWorkspace();
    } catch (error) {
      showSnackbar({
        title: t('errorDisposingPatient', 'Error disposing patient'),
        subtitle: error?.message || t('unknownError', 'Unknown error occurred'),
        kind: 'error',
        isLowContrast: true,
      });
    }
  };

  if (isLoadingEmrConfiguration || !personAttributes || !activeVisit) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading ..." />;
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContainer}>
        <Stack gap={3}>
          <DeceasedInfo patientUuid={patientUuid} />
          {isDischargeBlocked && (
            <InlineNotification
              kind="error"
              title={t('disposeBlocked', 'Dispose Blocked')}
              subtitle={blockingMessage}
              lowContrast={true}
              className={styles.blockingNotification}
            />
          )}
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
