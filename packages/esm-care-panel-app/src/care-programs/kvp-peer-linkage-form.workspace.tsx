import z from 'zod';
import styles from './kvp-patient-peer-form.scss';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfigObject, DefaultWorkspaceProps, showSnackbar, useConfig } from '@openmrs/esm-framework';
import toUpper from 'lodash/toUpper';
import React, { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  extractNameString,
  saveRelationship,
  usePatientActivePeerEducator,
  usePeerEducators,
  usePerson,
} from './kvp-program-actions.resource';

export const formSchema = z.object({
  personA: z.string().uuid('Invalid person'),
  personB: z.string().uuid('Invalid person').optional(),
  relationshipType: z.string().uuid(),
  startDate: z.date({ coerce: true }),
  endDate: z.date({ coerce: true }).optional(),
});
type FormType = z.infer<typeof formSchema>;
type KvpPeerLinkageFormProps = DefaultWorkspaceProps & { patientUuid: string };

const KvpPeerLinkageForm: FC<KvpPeerLinkageFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { data } = usePeerEducators();
  const { isLoading, person } = usePerson(patientUuid);
  const { caseManagerRelationshipType } = useConfig<ConfigObject>();
  const { mutate } = usePatientActivePeerEducator(patientUuid);
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
                  itemToString={(item) => toUpper(extractNameString(item ? item.text : ''))}
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

export default KvpPeerLinkageForm;
