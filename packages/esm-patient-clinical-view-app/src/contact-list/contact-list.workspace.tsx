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
  TextInput,
} from '@carbon/react';
import { Calculator } from '@carbon/react/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DefaultWorkspaceProps,
  showModal,
  showSnackbar,
  useConfig,
  usePatient,
  useSession,
} from '@openmrs/esm-framework';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
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
  props,
}) => {
  const form = useForm<ContactListFormType>({
    defaultValues: {
      address: '',
      givenName: '',
      middleName: '',
      familyName: '',
      maritalStatus: '',
      listingDate: new Date(),
      relationshipToPatient: '',
    },
    resolver: zodResolver(ContactListFormSchema),
  });
  const { t } = useTranslation();
  const session = useSession();
  const { patient } = usePatient();

  const patientRegistrationConfig = useConfig({ externalModuleName: '@kenyaemr/esm-patient-registration-app' });
  const config = useConfig<ConfigObject>();

  const onSubmit = async (values: ContactListFormType) => {
    const encounter = {
      location: session.sessionLocation.uuid,
      encounterProviders: [
        {
          provider: session.currentProvider.uuid,
          encounterRole: patientRegistrationConfig.registrationObs.encounterProviderRoleUuid,
        },
      ],
      form: patientRegistrationConfig.registrationObs.registrationFormUuid,
    };
    const results = await saveContact(values, patient.id, encounter, config);
    closeWorkspace();
    mutate((key) => {
      return typeof key === 'string' && key.startsWith('/ws/rest/v1/relationship');
    });
    results.forEach((res) => {
      showSnackbar({
        title: res.status === 'fulfilled' ? 'Success' : 'Failure',
        kind: res.status === 'fulfilled' ? 'success' : 'error',
        subtitle: res.message,
      });
    });
  };

  const maritalStatus = useMemo(
    () =>
      Object.entries(contactListConceptMap['1056AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'].answers).map(([uuid, display]) => ({
        label: display,
        value: uuid,
      })),
    [],
  );

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

  const handleCalculateBirthDate = () => {
    const dispose = showModal('birth-date-calculator', {
      onClose: () => dispose(),
      props: { date: new Date(), onBirthDateChange: (date) => form.setValue('dateOfBirth', date) },
    });
  };

  const observableRelationship = form.watch('relationshipToPatient');
  const observablePhysicalAssault = form.watch('physicalAssault');
  const observableThreatened = form.watch('threatened');
  const observableSexualAssault = form.watch('sexualAssault');
  const showIPVRelatedFields =
    config.contactSexualRelationships.findIndex((r) => r.uuid === observableRelationship) !== -1;

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
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <span className={styles.contactFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Controller
            control={form.control}
            name="listingDate"
            render={({ field }) => (
              <DatePicker
                dateFormat="d/m/Y"
                id="listingDate"
                datePickerType="single"
                {...field}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}>
                <DatePickerInput
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('listingDate', 'Listing Date')}
                  size="xl"
                />
              </DatePicker>
            )}
          />
        </Column>
        <span className={styles.sectionHeader}>Demographics</span>
        <Column>
          <Controller
            control={form.control}
            name="givenName"
            render={({ field }) => (
              <TextInput
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                {...field}
                placeholder="First name"
                labelText={t('firstName', 'First name')}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <TextInput
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                {...field}
                placeholder="Middle name"
                labelText={t('middleName', 'Middle name')}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="familyName"
            render={({ field }) => (
              <TextInput
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                {...field}
                placeholder="Last name"
                labelText={t('lastName', 'Last name')}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="gender"
            render={({ field }) => (
              <RadioButtonGroup
                legendText={t('sex', 'Sex')}
                {...field}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                className={styles.billingItem}>
                <RadioButton labelText={t('male', 'Male')} value="M" id="M" />
                <RadioButton labelText={t('female', 'Female')} value="F" id="F" />
              </RadioButtonGroup>
            )}
          />
        </Column>

        <Column className={styles.facilityColumn}>
          <Controller
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <DatePicker datePickerType="single" {...field}>
                <DatePickerInput
                  invalid={form.formState.errors[field.name]?.message}
                  invalidText={form.formState.errors[field.name]?.message}
                  placeholder="mm/dd/yyyy"
                  labelText={t('dateOfBirth', 'Date of birth')}
                  size="xl"
                  className={styles.datePickerInput}
                />
              </DatePicker>
            )}
          />
          <Button kind="ghost" renderIcon={Calculator} onClick={handleCalculateBirthDate}>
            From Age
          </Button>
        </Column>

        <Column>
          <Controller
            control={form.control}
            name="maritalStatus"
            render={({ field }) => (
              <Dropdown
                ref={field.ref}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                id="maritalStatus"
                titleText={t('maritalStatus', 'Marital status')}
                onChange={(e) => {
                  field.onChange(e.selectedItem);
                }}
                initialSelectedItem={field.value}
                label="Choose option"
                items={maritalStatus.map((r) => r.value)}
                itemToString={(item) => maritalStatus.find((r) => r.value === item)?.label ?? ''}
              />
            )}
          />
        </Column>
        <span className={styles.sectionHeader}>Contact</span>

        <Column>
          <Controller
            control={form.control}
            name="address"
            render={({ field }) => (
              <TextInput
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                {...field}
                placeholder="Physical Address/Landmark"
                labelText={t('address', 'Address')}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <TextInput
                {...field}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}
                placeholder="Phone number"
                labelText={t('phoneNumber', 'Phone number')}
              />
            )}
          />
        </Column>
        <span className={styles.sectionHeader}>Relationship</span>
        <Column>
          <Controller
            control={form.control}
            name="relationshipToPatient"
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
                items={config.familyRelationshipsTypeList.map((r) => r.uuid)}
                itemToString={(item) => config.familyRelationshipsTypeList.find((r) => r.uuid === item)?.display ?? ''}
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
            <span className={styles.sectionHeader}>IPV Questions</span>
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
            <span className={styles.sectionHeader}>IPV Outcome</span>
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
        <span className={styles.sectionHeader}>Baseline Information</span>

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
        <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ContactListForm;
