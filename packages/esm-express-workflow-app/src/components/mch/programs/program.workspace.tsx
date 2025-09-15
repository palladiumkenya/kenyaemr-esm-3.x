import React, { FC } from 'react';
import {
  Enrollement,
  Program,
  ProgramFormData,
  ProgramFormSchema,
  createProgramEnrollment,
  findLastState,
  updateProgramEnrollment,
} from '../mch.resource';
import styles from './program.scss';
import { Button, ButtonSet, Column, DatePicker, DatePickerInput, FormLabel, Stack, TextInput } from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { DefaultWorkspaceProps, LocationPicker, showSnackbar, useSession } from '@openmrs/esm-framework';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

type ProgramFormProps = DefaultWorkspaceProps & {
  enrollment?: Enrollement;
  patientUuid: string;
  program: Program;
  onSubmitSuccess?: () => void;
};

const ProgramForm: FC<ProgramFormProps> = ({ patientUuid, program, enrollment, closeWorkspace, onSubmitSuccess }) => {
  const getLocationUuid = () => {
    if (!enrollment?.location?.uuid && session?.sessionLocation?.uuid) {
      return session?.sessionLocation?.uuid;
    }
    return enrollment?.location?.uuid ?? null;
  };

  const session = useSession();
  const { t } = useTranslation();
  const form = useForm<ProgramFormData>({
    resolver: zodResolver(ProgramFormSchema),
    values: {
      dateEnrolled: new Date(),
      location: getLocationUuid() ?? '',
      dateCompleted: enrollment?.dateCompleted ? new Date(enrollment.dateCompleted) : undefined,
    },
  });

  const onSubmit = async (data: ProgramFormData) => {
    const abortController = new AbortController();
    try {
      if (enrollment) {
        await updateProgramEnrollment(enrollment.uuid, data, abortController);
      } else {
        await createProgramEnrollment(program, patientUuid, data, abortController);
      }
      showSnackbar({
        kind: 'success',
        title: 'Success',
        subtitle: t('programEnrollmentSuccessfull', 'Program enrollment successfull'),
      });

      closeWorkspace();
      onSubmitSuccess?.()
    } catch (e) {
      showSnackbar({ kind: 'error', title: 'Error', subtitle: e?.message });
      console.error(e);
    }
  };
  return (
    <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <TextInput
            readOnly
            value={program.name}
            title={t('program', 'Program')}
            id={'program'}
            labelText={t('program', 'Program')}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="dateEnrolled"
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                className={styles.datePickerInput}
                dateFormat="d/m/Y"
                datePickerType="single"
                value={field.value}
                onChange={(dates) => field.onChange(dates?.[0] ?? undefined)}
                invalid={!!error?.message}
                invalidText={error?.message}>
                <DatePickerInput
                  id={`startdate-input`}
                  invalid={!!error?.message}
                  invalidText={error?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('startDate', 'Start Date')}
                  size="lg"
                />
              </DatePicker>
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="dateCompleted"
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                className={styles.datePickerInput}
                dateFormat="d/m/Y"
                value={field.value}
                datePickerType="single"
                onChange={(dates) => field.onChange(dates?.[0] ?? undefined)}
                invalid={!!error?.message}
                invalidText={error?.message}>
                <DatePickerInput
                  id="endDate"
                  invalid={!!error?.message}
                  invalidText={error?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('endDate', 'End Date')}
                  size="lg"
                />
              </DatePicker>
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="location"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <React.Fragment>
                <FormLabel className={`${styles.locationLabel} cds--label`}>
                  {t('enrollmentLocation', 'Enrollment location')}
                </FormLabel>
                <LocationPicker
                  selectedLocationUuid={value}
                  defaultLocationUuid={session?.sessionLocation?.uuid}
                  locationTag="Login Location"
                  onChange={(locationUuid) => onChange(locationUuid)}
                />
              </React.Fragment>
            )}
          />
        </Column>
      </Stack>
      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </form>
  );
};

export default ProgramForm;
