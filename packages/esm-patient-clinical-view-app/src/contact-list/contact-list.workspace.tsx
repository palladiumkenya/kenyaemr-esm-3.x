import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Dropdown,
  Form,
  RadioButton,
  RadioButtonGroup,
  Stack,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, useConfig, useSession } from '@openmrs/esm-framework';
import React, { useEffect, useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { useMappedRelationshipTypes } from '../family-partner-history/relationships.resource';
import PatientSearchCreate from '../relationships/forms/patient-search-create-form';
import { contactListConceptMap } from './contact-list-concept-map';
import styles from './contact-list-form.scss';
import {
  BOOLEAN_NO,
  BOOLEAN_YES,
  contactIPVOutcomeOptions,
  ContactListFormSchema,
  saveContact,
} from './contact-list.resource';
interface ContactListFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
  props: any;
}

type ContactListFormType = z.infer<typeof ContactListFormSchema>;

const ContactListForm: React.FC<ContactListFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  patientUuid,
}) => {
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

  const config = useConfig<ConfigObject>();
  const { data } = useMappedRelationshipTypes();
  const pnsRelationshipTypes = data
    ? config.pnsRelationships.map((rel) => ({
        ...rel,
        display: data!.find((r) => r.uuid === rel.uuid)?.display,
      }))
    : [];

  const onSubmit = async (values: ContactListFormType) => {
    try {
      await saveContact(values, config, session);
      closeWorkspace();
    } catch (error) {}
  };

  const hivStatus = useMemo(
    () =>
      Object.entries(contactListConceptMap['1436AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'].answers).map(([uuid, display]) => ({
        label: display,
        value: uuid,
      })),
    [],
  );

  const pnsAproach = useMemo(
    () =>
      Object.entries(contactListConceptMap['7b827b42-9733-4d4f-8015-b40a07ac3052'].answers).map(([uuid, display]) => ({
        label: display,
        value: uuid,
      })),
    [],
  );

  const contactLivingWithPatient = useMemo(
    () =>
      Object.entries(contactListConceptMap['36906d55-ade7-4d1a-b3b7-18fd59bffb0f'].answers).map(([uuid, display]) => ({
        label: display,
        value: uuid,
      })),
    [],
  );

  const observableRelationship = form.watch('relationshipType');
  const observablePhysicalAssault = form.watch('physicalAssault');
  const observableThreatened = form.watch('threatened');
  const observableSexualAssault = form.watch('sexualAssault');
  const showIPVRelatedFields =
    config.pnsRelationships.findIndex((r) => r.uuid === observableRelationship && r.sexual) !== -1;

  useEffect(() => {
    if ([observablePhysicalAssault, observableThreatened, observableSexualAssault].includes(BOOLEAN_YES)) {
      form.setValue('ipvOutCome', 'True');
    } else if (
      [observablePhysicalAssault, observableThreatened, observableSexualAssault].every((v) => v === BOOLEAN_NO)
    ) {
      form.setValue('ipvOutCome', 'False');
    }
    if (!showIPVRelatedFields) {
      form.setValue('ipvOutCome', undefined);
    }
  }, [observablePhysicalAssault, observableThreatened, observableSexualAssault, observableRelationship]);

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <span className={styles.formTitle}>{t('formTitle', 'Fill in the form details')}</span>
        <Stack gap={4} className={styles.grid}>
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
              control={form.control}
              name="relationshipType"
              render={({ field }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
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
          <Column>
            <Controller
              control={form.control}
              name="livingWithClient"
              render={({ field }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  id="livingWithClient"
                  titleText={t('livingWithClient', 'Living with client')}
                  onChange={(e) => {
                    field.onChange(e.selectedItem);
                  }}
                  initialSelectedItem={field.value}
                  label="Select"
                  items={contactLivingWithPatient.map((r) => r.value)}
                  itemToString={(item) => contactLivingWithPatient.find((r) => r.value === item)?.label ?? ''}
                />
              )}
            />
          </Column>
          {showIPVRelatedFields && (
            <>
              <span className={styles.sectionHeader}>{t('ipvQuestions', 'IPV Questions')}</span>
              <Column>
                <Controller
                  control={form.control}
                  name="physicalAssault"
                  render={({ field }) => (
                    <RadioButtonGroup
                      id="physicalAssault"
                      legendText={t(
                        'physicalAssault',
                        '1. Has he/she ever hit, kicked, slapped, or otherwise physically hurt you?',
                      )}
                      {...field}
                      invalid={form.formState.errors[field.name]?.message}
                      invalidText={form.formState.errors[field.name]?.message}
                      className={styles.billingItem}>
                      <RadioButton labelText={t('yes', 'Yes')} value={BOOLEAN_YES} id="physicalAssault_yes" />
                      <RadioButton labelText={t('no', 'No')} value={BOOLEAN_NO} id="physicalAssault_no" />
                    </RadioButtonGroup>
                  )}
                />
              </Column>
              <Column>
                <Controller
                  control={form.control}
                  name="threatened"
                  render={({ field }) => (
                    <RadioButtonGroup
                      id="threatened"
                      legendText={t('threatened', '2. Has he/she ever threatened to hurt you?')}
                      {...field}
                      invalid={form.formState.errors[field.name]?.message}
                      invalidText={form.formState.errors[field.name]?.message}
                      className={styles.billingItem}>
                      <RadioButton labelText={t('yes', 'Yes')} value={BOOLEAN_YES} id="threatened_yes" />
                      <RadioButton labelText={t('no', 'No')} value={BOOLEAN_NO} id="threatened_no" />
                    </RadioButtonGroup>
                  )}
                />
              </Column>
              <Column>
                <Controller
                  control={form.control}
                  name="sexualAssault"
                  render={({ field }) => (
                    <RadioButtonGroup
                      id="sexualAssault"
                      legendText={t(
                        'sexualAssault',
                        '3.Has he/she ever forced you to do something sexually that made you feel uncomfortable?',
                      )}
                      {...field}
                      invalid={form.formState.errors[field.name]?.message}
                      invalidText={form.formState.errors[field.name]?.message}
                      className={styles.billingItem}>
                      <RadioButton labelText={t('yes', 'Yes')} value={BOOLEAN_YES} id="sexualAssault_yes" />
                      <RadioButton labelText={t('no', 'No')} value={BOOLEAN_NO} id="sexualAssault_no" />
                    </RadioButtonGroup>
                  )}
                />
              </Column>
              <span className={styles.sectionHeader}>{t('ipvOutcome', 'IPV Outcome')}</span>
              <Column>
                <Controller
                  control={form.control}
                  name="ipvOutCome"
                  render={({ field }) => (
                    <Dropdown
                      ref={field.ref}
                      invalid={form.formState.errors[field.name]?.message}
                      invalidText={form.formState.errors[field.name]?.message}
                      id="ipvOutCome"
                      titleText={t('ipvOutCome', 'IPV Outcome')}
                      onChange={(e) => {
                        field.onChange(e.selectedItem);
                      }}
                      selectedItem={field.value}
                      label="Choose option"
                      items={contactIPVOutcomeOptions.map((r) => r.value)}
                      itemToString={(item) => {
                        return contactIPVOutcomeOptions.find((r) => r.value === item)?.label ?? '';
                      }}
                    />
                  )}
                />
              </Column>
            </>
          )}
          <span className={styles.sectionHeader}>{t('baselineInformation', 'Baseline Information')}</span>
          <Column>
            <Controller
              control={form.control}
              name="baselineStatus"
              render={({ field }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  id="baselineStatus"
                  titleText={t('baselineStatus', 'HIV Status')}
                  onChange={(e) => {
                    field.onChange(e.selectedItem);
                  }}
                  initialSelectedItem={field.value}
                  label="Select HIV Status"
                  items={hivStatus.map((r) => r.value)}
                  itemToString={(item) => hivStatus.find((r) => r.value === item)?.label ?? ''}
                />
              )}
            />
          </Column>
          <Column>
            <Controller
              control={form.control}
              name="preferedPNSAproach"
              render={({ field }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  id="preferedPNSAproach"
                  titleText={t('preferedPNSAproach', 'Prefered PNS Aproach')}
                  onChange={(e) => {
                    field.onChange(e.selectedItem);
                  }}
                  initialSelectedItem={field.value}
                  label="Select Aproach"
                  items={pnsAproach.map((r) => r.value)}
                  itemToString={(item) => pnsAproach.find((r) => r.value === item)?.label ?? ''}
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
            disabled={form.formState.isSubmitting || !form.formState.isValid}>
            {t('submit', 'Submit')}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default ContactListForm;
