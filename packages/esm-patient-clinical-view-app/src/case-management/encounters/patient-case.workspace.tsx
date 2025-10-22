import React, { FC } from 'react';
import { saveRelationship, useCaseManagers } from '../workspace/case-management.resource';
import { DefaultWorkspaceProps, showSnackbar, useConfig } from '@openmrs/esm-framework';
import usePerson from '../../contact-list/contact-list.resource';
import { relationshipFormSchema } from '../../relationships/relationship.resources';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSet,
  Column,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Form,
  Stack,
  TextInput,
} from '@carbon/react';
import styles from './patient-case-form.scss';
import { useTranslation } from 'react-i18next';
import { extractNameString, uppercaseText } from '../../utils/expression-helper';
import { ConfigObject } from '../../config-schema';
import { usePatientActiveCases } from './case-encounter-table.resource';

type PatientCaseFormProps = DefaultWorkspaceProps & { patientUuid: string };
const formSchema = relationshipFormSchema.pick({
  personA: true,
  personB: true,
  relationshipType: true,
  startDate: true,
  endDate: true,
});

type FormType = z.infer<typeof formSchema>;

const PatientCaseForm: FC<PatientCaseFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { data } = useCaseManagers();
  const { isLoading, person } = usePerson(patientUuid);
  const { caseManagerRelationshipType } = useConfig<ConfigObject>();
  const { mutate } = usePatientActiveCases(patientUuid);
  const { t } = useTranslation();
  const caseManagers =
    data?.data.results.map((manager) => ({
      id: manager.person.uuid,
      text: manager.display,
    })) || [];

  const form = useForm<FormType>({
    mode: 'all',
    defaultValues: {
      personA: patientUuid,
      personB: '',
      relationshipType: caseManagerRelationshipType,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: FormType) => {
    try {
      await saveRelationship(values);
      showSnackbar({
        kind: 'success',
        title: t('success', 'Success'),
        subtitle: t('caseSavedSuccesfully', 'Case saved successfully'),
        isLowContrast: true,
      });
      mutate();
      closeWorkspace();
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('error', 'Error'),
        subtitle: t('errorAddingCase', 'Error Adding patient case'),
        isLowContrast: true,
      });
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Controller
            control={form.control}
            name="startDate"
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                className={styles.datePickerInput}
                dateFormat="d/m/Y"
                datePickerType="single"
                {...field}
                onChange={([date]) => field.onChange(date)}
                ref={undefined}
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
            name="endDate"
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                className={styles.datePickerInput}
                dateFormat="d/m/Y"
                datePickerType="single"
                {...field}
                onChange={([date]) => field.onChange(date)}
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
          <TextInput id="patient" labelText={t('patient', 'Patient')} value={person?.display} readOnly />
        </Column>
        <Column>
          <Controller
            name="personB"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <ComboBox
                  id="case_manager_name"
                  titleText={t('manager', 'Case Manager')}
                  placeholder="Select Case Manager"
                  items={caseManagers}
                  itemToString={(item) => uppercaseText(extractNameString(item ? item.text : ''))}
                  onChange={(e) => {
                    field.onChange(e.selectedItem?.id);
                  }}
                  selectedItem={caseManagers.find((manager) => manager.id === field.value)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              );
            }}
          />
        </Column>
        <Column>
          <TextInput
            id="relationshipType"
            labelText={t('relationshipType', 'Relationship to patient')}
            value={t('caseManager', 'Case Manager')}
            readOnly
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
    </Form>
  );
};

export default PatientCaseForm;
