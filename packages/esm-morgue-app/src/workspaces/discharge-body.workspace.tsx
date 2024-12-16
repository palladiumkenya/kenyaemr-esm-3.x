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
import { getCurrentTime } from '../utils/utils';
import { ConfigObject } from '../config-schema';
import { mutate } from 'swr';

interface DischargeFormProps {
  closeWorkspace: () => void;
  patientUuid: string;
}

const dischargeSchema = z.object({
  dateOfDischarge: z.date({ coerce: true }).refine((date) => !!date, 'Date of discharge is required'),
  timeOfDischarge: z.string().nonempty('Time of discharge is required'),
  period: z
    .string()
    .nonempty('AM/PM is required')
    .regex(/^(AM|PM)$/i, 'Invalid period'),
  burialPermitNumber: z.string().nonempty('Burial Permit Number is required'),
});

type DischargeFormValues = z.infer<typeof dischargeSchema>;

const DischargeForm: React.FC<DischargeFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { currentVisit, currentVisitIsRetrospective } = useVisit(patientUuid);
  const { queueEntry } = useVisitQueueEntry(patientUuid, currentVisit?.uuid);

  const { time: defaultTime, period: defaultPeriod } = getCurrentTime();

  const {
    currentProvider: { uuid: currentProviderUuid },
    sessionLocation: { uuid: locationUuid },
  } = useSession();

  const {
    burialPermitNumberUuid,
    encounterProviderRoleUuid,
    morgueAdmissionEncounterType,
    morgueDischargeEncounterTypeUuid,
    morgueVisitTypeUuid,
  } = useConfig<ConfigObject>();

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
      const obs = [];
      if (data.burialPermitNumber) {
        obs.push({ concept: burialPermitNumberUuid, value: data.burialPermitNumber });
      }

      const encounterPayload = {
        encounterDatetime: data?.dateOfDischarge,
        patient: currentVisit?.patient?.uuid,
        encounterType: morgueDischargeEncounterTypeUuid,
        location: currentVisit?.location?.uuid,
        encounterProviders: [
          {
            provider: currentProviderUuid,
            encounterRole: encounterProviderRoleUuid,
          },
        ],
        visit: currentVisit?.uuid,
        obs: obs.length > 0 ? obs : undefined,
      };

      const endVisitPayload = {
        stopDatetime: data.dateOfDischarge,
      };

      const abortController = new AbortController();

      try {
        // First, create the encounter
        await startVisitWithEncounter(encounterPayload);

        showSnackbar({
          title: 'Discharge',
          subtitle: 'The deceased has been discharged successfully',
          kind: 'success',
        });

        // Then, end the visit
        updateVisit(currentVisit.uuid, endVisitPayload, abortController).subscribe({
          next: (response) => {
            if (queueEntry) {
              removeQueuedPatient(
                queueEntry.queue.uuid,
                queueEntry.queueEntryUuid,
                abortController,
                response?.data.stopDatetime,
              );
            }
            closeWorkspace();
            showSnackbar({
              isLowContrast: true,
              kind: 'success',
              subtitle: t('visitEndSuccessfully', `${response?.data?.visitType?.display} ended successfully`),
              title: t('visitEnded', 'Visit ended'),
            });
            mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/visit`));
          },
          error: (error) => {
            showSnackbar({
              title: t('errorEndingVisit', 'Error ending visit'),
              kind: 'error',
              isLowContrast: false,
              subtitle: error?.message,
            });
          },
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
