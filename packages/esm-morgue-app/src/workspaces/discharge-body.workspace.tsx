import React from 'react';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  Stack,
  TimePicker,
  TimePickerSelect,
  SelectItem,
  Column,
  InlineLoading,
  TextInput,
} from '@carbon/react';
import {
  ResponsiveWrapper,
  restBaseUrl,
  setCurrentVisit,
  showSnackbar,
  useConfig,
  useLayoutType,
  useSession,
  useVisit,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './discharge-body.scss';
import DeceasedInfo from '../component/deceasedInfo/deceased-info.component';
import {
  removeQueuedPatient,
  startVisitWithEncounter,
  updateVisit,
  useVisitQueueEntry,
} from '../hook/useMorgue.resource';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dischargeSchema, getCurrentTime } from '../utils/utils';
import { ConfigObject } from '../config-schema';
import { mutate } from 'swr';
import { useMortuaryOperation } from '../hook/useAdmitPatient';

interface DischargeFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
  bedId: number;
}

type DischargeFormValues = z.infer<typeof dischargeSchema>;

const DischargeForm: React.FC<DischargeFormProps> = ({ closeWorkspace, patientUuid, bedId }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { currentVisit, currentVisitIsRetrospective } = useVisit(patientUuid);
  const { queueEntry } = useVisitQueueEntry(patientUuid, currentVisit?.uuid);
  const { dischargeBody, isLoadingEmrConfiguration } = useMortuaryOperation();

  const { time: defaultTime, period: defaultPeriod } = getCurrentTime();

  const { burialPermitNumberUuid, encounterProviderRoleUuid, morgueVisitTypeUuid } = useConfig<ConfigObject>();

  const {
    control,
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

  const onSubmit = async (data: DischargeFormValues) => {
    if (currentVisitIsRetrospective) {
      setCurrentVisit(null, null);
      closeWorkspace();
    } else {
      try {
        // Then, end the visit
        await dischargeBody(currentVisit, queueEntry, bedId, data);
        showSnackbar({
          title: 'Visit Discharged',
          subtitle: 'Visit Discharged successfully',
          kind: 'success',
          isLowContrast: true,
        });
      } catch (error) {
        const errorMessage = JSON.stringify(error?.responseBody?.error?.message?.replace(/\[/g, '').replace(/\]/g, ''));
        showSnackbar({
          title: 'Visit Error',
          subtitle: `An error has occurred while starting visit, Contact system administrator quoting this error ${errorMessage}`,
          kind: 'error',
          isLowContrast: true,
        });
      }
    }
  };

  if (isLoadingEmrConfiguration) {
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
            {t('admit', 'Admit')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default DischargeForm;
