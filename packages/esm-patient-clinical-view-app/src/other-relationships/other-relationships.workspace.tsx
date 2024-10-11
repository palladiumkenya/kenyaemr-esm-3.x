import { Button, ButtonSet, Column, ComboBox, DatePicker, DatePickerInput, Form, Stack, TextArea } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { useMappedRelationshipTypes, usePatientRelationships } from '../family-partner-history/relationships.resource';
import PatientSearchCreate from '../relationships/forms/patient-search-create-form';
import { relationshipFormSchema, saveRelationship } from '../relationships/relationship.resources';
import { uppercaseText } from '../utils/expression-helper';
import styles from './other-relationships.scss';

const schema = relationshipFormSchema.extend({
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type OtherRelationshipsFormProps = {
  closeWorkspace: () => void;
  rootPersonUuid: string;
};

export const OtherRelationshipsForm: React.FC<OtherRelationshipsFormProps> = ({ closeWorkspace, rootPersonUuid }) => {
  const { t } = useTranslation();
  const { relationshipsUrl } = usePatientRelationships(rootPersonUuid);
  const { data: mappedRelationshipTypes } = useMappedRelationshipTypes();
  const config = useConfig<ConfigObject>();
  const { familyRelationshipsTypeList } = config;
  const familyRelationshipTypesUUIDs = new Set(familyRelationshipsTypeList.map((r) => r.uuid));
  const otherRelationshipTypes = mappedRelationshipTypes.filter((type) => !familyRelationshipTypesUUIDs.has(type.uuid));
  const session = useSession();
  const relationshipTypes = otherRelationshipTypes.map((relationship) => ({
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
    await saveRelationship(data, config, session, []);
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
          <Column>
            <Controller
              name="relationshipType"
              control={control}
              render={({ field, fieldState }) => (
                <ComboBox
                  id="relationship_name"
                  titleText={t('relationship', 'Relationship')}
                  placeholder="Select Relationship"
                  items={relationshipTypes}
                  itemToString={(item) => (item ? uppercaseText(item.text) : '')}
                  onChange={(e) => field.onChange(e.selectedItem?.id)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                />
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
            disabled={!isValid || form.formState.isSubmitting}>
            {t('save', 'Save')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};
