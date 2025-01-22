import { Button, ButtonSet, Column, ComboBox, DatePicker, DatePickerInput, Form, Stack, TextArea } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConfig, useSession } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import PatientSearchCreate from '../relationships/forms/patient-search-create-form';
import { relationshipFormSchema, saveRelationship } from '../relationships/relationship.resources';
import { uppercaseText } from '../utils/expression-helper';
import styles from './family-relationship.scss';
import { useMappedRelationshipTypes } from './relationships.resource';

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
  const { familyRelationshipsTypeList } = config;
  const familyRelationshipTypesUUIDs = new Set(familyRelationshipsTypeList.map((r) => r.uuid));
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

  const { control, handleSubmit } = form;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await saveRelationship(data, config, session, []); /// Remove notes from payload since endpoint doesn't expect it to avoid 400 error
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
                  itemToString={(item) => (item ? uppercaseText(item.text) : '')}
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
                  id="startDate"
                  datePickerType="single"
                  {...field}
                  ref={undefined}
                  invalid={error?.message}
                  invalidText={error?.message}>
                  <DatePickerInput
                    invalid={error?.message}
                    invalidText={error?.message}
                    placeholder="mm/dd/yyyy"
                    labelText={t('startDate', 'Start Date')}
                    size="xl"
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
                  id="endDate"
                  datePickerType="single"
                  {...field}
                  ref={undefined}
                  invalid={error?.message}
                  invalidText={error?.message}>
                  <DatePickerInput
                    invalid={error?.message}
                    invalidText={error?.message}
                    placeholder="mm/dd/yyyy"
                    labelText={t('endDate', 'End Date')}
                    size="xl"
                  />
                </DatePicker>
              )}
            />
          </Column>
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
