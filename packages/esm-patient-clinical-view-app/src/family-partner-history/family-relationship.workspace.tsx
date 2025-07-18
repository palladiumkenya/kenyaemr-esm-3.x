import { Button, ButtonSet, Column, ComboBox, DatePicker, DatePickerInput, Form, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseDate, useConfig, useSession } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { saveContact } from '../contact-list/contact-list.resource';
import usePersonAttributes from '../hooks/usePersonAttributes';
import RelationshipBaselineInfoFormSection from '../relationships/forms/baseline-info-form-section.component';
import PatientSearchCreate from '../relationships/forms/patient-search-create-form';
import { relationshipFormSchema, usePatientBirthdate } from '../relationships/relationship.resources';
import { uppercaseText } from '../utils/expression-helper';
import styles from './family-relationship.scss';
import { useMappedRelationshipTypes } from './relationships.resource';
import dayjs from 'dayjs';

const schema = relationshipFormSchema
  .refine(
    (data) => {
      return !(data.mode === 'search' && !data.personB);
    },
    { message: 'Required', path: ['personB'] },
  )
  .refine(
    (data) => {
      return !(data.mode === 'create' && !data.personBInfo);
    },
    { path: ['personBInfo'], message: 'Please provide patient information' },
  );
type FormData = z.infer<typeof schema>;

type RelationshipFormProps = {
  closeWorkspace: () => void;
  patientUuid: string;
};

const FamilyRelationshipForm: React.FC<RelationshipFormProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const { data: mappedRelationshipTypes } = useMappedRelationshipTypes();
  const config = useConfig<ConfigObject>();
  const familyRelationships = useMemo(
    () => config.relationshipTypesList.filter((rl) => rl.category.some((c) => c === 'family')),
    [config],
  );
  const familyRelationshipTypesUUIDs = new Set(familyRelationships.map((r) => r.uuid));
  const familyRelationshipTypes = mappedRelationshipTypes.filter((type) => familyRelationshipTypesUUIDs.has(type.uuid));
  const session = useSession();

  const relationshipTypes = familyRelationshipTypes.map((relationship) => ({
    id: relationship.uuid,
    text: relationship.display,
  }));

  const form = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      personA: patientUuid,
      mode: 'search',
    },
    resolver: zodResolver(schema),
  });
  const personUuid = form.watch('personB');
  const { attributes } = usePersonAttributes(personUuid);
  const { isLoading: isPatientloading, birthdate } = usePatientBirthdate(personUuid);
  const mode = form.watch('mode');
  const dobCreateMode = form.watch('personBInfo.birthdate');
  const patientAgeMonths = useMemo(() => {
    let birthDate: Date | null = null;
    if (mode === 'create') {
      birthDate = dobCreateMode;
    } else {
      birthDate = birthdate ? parseDate(birthdate) : null;
    }
    if (birthDate) {
      return dayjs().diff(birthDate, 'month');
    }
    return null;
  }, [mode, dobCreateMode, birthdate]);
  const { control, handleSubmit } = form;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await saveContact(data, config, session, attributes); /// Remove notes from payload since endpoint doesn't expect it to avoid 400 error
      closeWorkspace();
    } catch (error) {}
  };

  return (
    <FormProvider {...form}>
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={5} className={styles.grid}>
          <PatientSearchCreate />
          <span className={styles.sectionHeader}>{t('relationship', 'Relationship')}</span>
          <Column>
            <Controller
              name="relationshipType"
              control={control}
              render={({ field, fieldState }) => (
                <ComboBox
                  id="relationship_name"
                  titleText={t('relationship', 'Relationship')}
                  placeholder="Relationship to patient"
                  items={relationshipTypes}
                  itemToString={(item) => item?.text ?? ''}
                  onChange={(e) => field.onChange(e.selectedItem?.id)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
              )}
            />
          </Column>

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
                  ref={undefined}
                  invalid={!!error?.message}
                  invalidText={error?.message}>
                  <DatePickerInput
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    placeholder="mm/dd/yyyy"
                    labelText={t('startDate', 'Start Date')}
                    size="lg"
                    id="startDate"
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
                  ref={undefined}
                  invalid={!!error?.message}
                  invalidText={error?.message}>
                  <DatePickerInput
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    placeholder="mm/dd/yyyy"
                    labelText={t('endDate', 'End Date')}
                    size="lg"
                    id="endDate"
                  />
                </DatePicker>
              )}
            />
          </Column>
          <RelationshipBaselineInfoFormSection patientUuid={personUuid} patientAgeMonths={patientAgeMonths} />
        </Stack>

        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
            {t('save', 'Save')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default FamilyRelationshipForm;
