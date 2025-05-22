import { Button, ButtonSet, Column, DatePicker, DatePickerInput, Dropdown, Form, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, useConfig, useSession } from '@openmrs/esm-framework';
import React, { useEffect, useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { useMappedRelationshipTypes } from '../family-partner-history/relationships.resource';
import usePersonAttributes from '../hooks/usePersonAttributes';
import RelationshipBaselineInfoFormSection from '../relationships/forms/baseline-info-form-section.component';
import PatientSearchCreate from '../relationships/forms/patient-search-create-form';
import styles from './contact-list-form.scss';
import { ContactListFormSchema, saveContact } from './contact-list.resource';
interface ContactListFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
  props: any;
}

type ContactListFormType = z.infer<typeof ContactListFormSchema>;

const ContactListForm: React.FC<ContactListFormProps> = ({ closeWorkspace, patientUuid }) => {
  const form = useForm<ContactListFormType>({
    mode: 'all',
    defaultValues: {
      personA: patientUuid,
      mode: 'search',
    },
    resolver: zodResolver(ContactListFormSchema),
  });
  const { t } = useTranslation();
  const session = useSession();
  const personUuid = form.watch('personB');
  const { attributes } = usePersonAttributes(personUuid);

  const config = useConfig<ConfigObject>();
  const { data } = useMappedRelationshipTypes();
  const pnsRelationships = useMemo(
    () => config.relationshipTypesList.filter((rl) => rl.category.some((c) => c === 'pns')),
    [config],
  );
  const pnsRelationshipTypes = data
    ? pnsRelationships.map((rel) => ({
        ...rel,
        display: data!.find((r) => r.uuid === rel.uuid)?.display,
      }))
    : [];

  const onSubmit = async (values: ContactListFormType) => {
    try {
      await saveContact(values, config, session, attributes);
      closeWorkspace();
    } catch (error) {}
  };

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <Stack gap={4} className={styles.grid}>
          <PatientSearchCreate />
          <span className={styles.sectionHeader}>{t('relationship', 'Relationship')}</span>
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
                    id={`startdate-input`}
                    name="startdate-input"
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
          <Column>
            <Controller
              control={form.control}
              name="relationshipType"
              render={({ field, fieldState: { error } }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={error?.message}
                  invalidText={error?.message}
                  id="relationshipToPatient"
                  titleText={t('relationToPatient', 'Relation to patient')}
                  onChange={(e) => {
                    field.onChange(e.selectedItem);
                  }}
                  initialSelectedItem={field.value}
                  label="Select Realtionship"
                  items={pnsRelationshipTypes.map((r) => r.uuid)}
                  itemToString={(item) => pnsRelationshipTypes.find((r) => r.uuid === item)?.display ?? ''}
                />
              )}
            />
          </Column>

          <RelationshipBaselineInfoFormSection />
        </Stack>

        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
            {t('submit', 'Submit')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default ContactListForm;
