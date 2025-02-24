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
import { mutate } from 'swr';
import { z } from 'zod';
import DeceasedInfo from '../component/deceasedInfo/deceased-info.component';
import { ConfigObject } from '../config-schema';
import { useMortuaryOperation } from '../hook/useAdmitPatient';
import { useVisitQueueEntry } from '../hook/useMorgue.resource';
import { usePersonAttributes } from '../hook/usePersonAttributes';
import { PatientInfo } from '../types';
import { dischargeSchema, getCurrentTime } from '../utils/utils';
import styles from './discharge-body.scss';

interface DischargeFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
  personUuid: string;
  bedId: number;
}

type DischargeFormValues = z.infer<typeof dischargeSchema>;

const DischargeForm: React.FC<DischargeFormProps> = ({ closeWorkspace, patientUuid, bedId, personUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { currentVisit, currentVisitIsRetrospective } = useVisit(patientUuid);
  const { queueEntry } = useVisitQueueEntry(patientUuid, currentVisit?.uuid);
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
    formState: { errors },
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
          uuid: currentVisit.patient.uuid,
          attributes: currentVisit?.patient?.person?.attributes || [],
        };

        for (const attribute of nextOfKinAttributes) {
          await createOrUpdatePersonAttribute(patientUuid, attribute, patientInfo);
        }

        await dischargeBody(currentVisit, queueEntry, bedId, data);

        showSnackbar({
          title: t('dischargeDeceasedPatient', 'Deceased patient'),
          subtitle: t('deceasedPatientDischargedSuccessfully', 'Deceased patient has been discharged successfully'),
          kind: 'success',
          isLowContrast: true,
        });

        mutate(
          (key) =>
            typeof key === 'string' && key.startsWith(`${restBaseUrl}/patient/${patientUuid}/chart/deceased-panel`),
          undefined,
        );
        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/visit`));
        closeWorkspace();
      } catch (error) {
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
    <Form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.formGrid}>
        <DeceasedInfo patientUuid={patientUuid} />
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
                className={styles.fieldSection}
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
                className={styles.fieldSection}
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
                className={styles.fieldSection}
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
                className={styles.fieldSection}
                placeholder={t('nextOfKinAddress', 'Next of kin address')}
                labelText={t('nextOfKinAddress', 'Next of kin address')}
                invalid={!!errors.nextOfKinAddress}
                invalidText={errors.nextOfKinAddress?.message}
              />
            )}
          />
        </Column>

        <ButtonSet className={styles.buttonSet}>
          <Button size="lg" kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button kind="primary" size="lg" type="submit">
            {t('submit', 'Submit')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default DischargeForm;
