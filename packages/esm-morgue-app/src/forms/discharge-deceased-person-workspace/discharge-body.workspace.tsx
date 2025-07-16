import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  InlineLoading,
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
import styles from './discharge-body.scss';
import DeceasedInfo from '../../deceased-patient-header/deceasedInfo/deceased-info.component';
import { PatientInfo } from '../../types';
import { usePersonAttributes } from './discharge-body.resource';
import { ConfigObject } from '../../config-schema';
import { getCurrentTime } from '../../utils/utils';
import { dischargeSchema } from '../../schemas';
import { useVisitQueueEntry } from '../../home/home.resource';
import classNames from 'classnames';
import { useMortuaryOperation } from '../admit-deceased-person-workspace/admit-deceased-person.resource';

interface DischargeFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
  personUuid: string;
  bedId: number;
  mutate: () => void;
}

type DischargeFormValues = z.infer<typeof dischargeSchema>;

const DischargeForm: React.FC<DischargeFormProps> = ({ closeWorkspace, patientUuid, bedId, personUuid, mutate }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { activeVisit, currentVisitIsRetrospective } = useVisit(patientUuid);
  const { queueEntry } = useVisitQueueEntry(patientUuid, activeVisit?.uuid);
  const { dischargeBody, isLoadingEmrConfiguration } = useMortuaryOperation();
  const { createOrUpdatePersonAttribute, personAttributes } = usePersonAttributes(personUuid);

  const { time: defaultTime, period: defaultPeriod } = getCurrentTime();

  const { nextOfKinAddressUuid, nextOfKinNameUuid, nextOfKinPhoneUuid, nextOfKinRelationshipUuid } =
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
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<DischargeFormValues>({
    resolver: zodResolver(dischargeSchema),
    defaultValues: {
      dateOfDischarge: new Date(),
      timeOfDischarge: defaultTime,
      period: defaultPeriod,
      burialPermitNumber: '',
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
  const onSubmit = async (data: DischargeFormValues) => {
    if (currentVisitIsRetrospective) {
      setCurrentVisit(null, null);
      closeWorkspace();
    } else {
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
          await createOrUpdatePersonAttribute(patientUuid, attribute, patientInfo);
        }

        await dischargeBody(activeVisit, queueEntry, bedId, data);

        showSnackbar({
          title: t('dischargeDeceasedPatient', 'Deceased patient'),
          subtitle: t('deceasedPatientDischargedSuccessfully', 'Deceased patient has been discharged successfully'),
          kind: 'success',
          isLowContrast: true,
        });
        mutateSWR((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/visit`));
        mutateSWR((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/patient`));
        mutateSWR((key) => typeof key === 'string' && key.startsWith(`${fhirBaseUrl}/Encounter`));

        mutate();
        closeWorkspace();
      } catch (error) {
        console.error(error);
        const errorMessage = JSON.stringify(error?.responseBody?.error?.message?.replace(/\[/g, '').replace(/\]/g, ''));
        showSnackbar({
          title: t('visitError', 'Visit Error'),
          subtitle: t(
            'visitErrorMessage',
            `An error has occurred while ending visit, Contact system administrator quoting this error ${errorMessage}`,
          ),
          kind: 'error',
          isLowContrast: true,
        });
      }
    }
  };

  if (isLoadingEmrConfiguration || !personAttributes) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading ..." />;
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContainer}>
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
                        id="date-of-admission"
                        placeholder="yyyy-mm-dd"
                        labelText={t('dateOfAdmission', 'Date of discharge*')}
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
                name="burialPermitNumber"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="burialPermitNumber"
                    type="text"
                    className={styles.sectionField}
                    placeholder={t('burialPermitNumber', 'Burial permit number')}
                    labelText={t('burialPermitNumber', 'Burial permit number')}
                    invalid={!!errors.burialPermitNumber}
                    invalidText={errors.burialPermitNumber?.message}
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
                    id="relationship"
                    type="text"
                    className={styles.sectionField}
                    placeholder={t('relationship', 'Relationship')}
                    labelText={t('relationship', 'Relationship')}
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
                    id="telephone"
                    type="text"
                    className={styles.fieldSection}
                    placeholder={t('telephone', 'Telephone number')}
                    labelText={t('telephone', 'Telephone number')}
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

export default DischargeForm;
