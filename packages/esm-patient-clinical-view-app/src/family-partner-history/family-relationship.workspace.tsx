import { Button, ButtonSet, Column, ComboBox, DatePicker, DatePickerInput, Form, Stack, TextArea } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExtensionSlot, useConfig, useSession } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import PatientInfo from '../case-management/workspace/patient-info.component';
import { ConfigObject } from '../config-schema';
import { relationshipFormSchema, saveRelationship } from '../relationships/relationship.resources';
import { uppercaseText } from '../utils/expression-helper';
import styles from './family-relationship.scss';
import { useMappedRelationshipTypes } from './relationships.resource';
import PatientSearchCreate from '../relationships/forms/patient-search-create-form';

const schema = relationshipFormSchema
  .extend({
    notes: z.string().optional(),
  })
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
  rootPersonUuid: string;
};

const FamilyRelationshipForm: React.FC<RelationshipFormProps> = ({ closeWorkspace, rootPersonUuid }) => {
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
      personA: rootPersonUuid,
      mode: 'search',
    },
    resolver: zodResolver(schema),
  });

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await saveRelationship(data, config, session, []);
      closeWorkspace();
    } catch (error) {}
  };

  return (
    <FormProvider {...form}>
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <span className={styles.caseFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
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
              render={({ field }) => (
                <DatePicker
                  className={styles.datePickerInput}
                  dateFormat="d/m/Y"
                  id="startDate"
                  datePickerType="single"
                  {...field}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}>
                  <DatePickerInput
                    invalid={form.formState.errors[field.name]?.message}
                    invalidText={form.formState.errors[field.name]?.message}
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
              render={({ field }) => (
                <DatePicker
                  className={styles.datePickerInput}
                  dateFormat="d/m/Y"
                  id="endDate"
                  datePickerType="single"
                  {...field}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}>
                  <DatePickerInput
                    invalid={form.formState.errors[field.name]?.message}
                    invalidText={form.formState.errors[field.name]?.message}
                    placeholder="mm/dd/yyyy"
                    labelText={t('endDate', 'End Date')}
                    size="xl"
                  />
                </DatePicker>
              )}
            />
          </Column>
          <Column className={styles.textbox}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextArea
                  labelText={t('additionalNotes', 'Any additional notes')}
                  rows={4}
                  id="relationship-notes"
                  {...field}
                />
              )}
            />
          </Column>
        </Stack>

        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            kind="primary"
            type="submit"
            disabled={!isValid || form.formState.isLoading}>
            {t('save', 'Save')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default FamilyRelationshipForm;
