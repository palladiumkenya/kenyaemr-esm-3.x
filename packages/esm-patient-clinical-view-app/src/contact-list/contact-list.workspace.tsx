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
import { DefaultWorkspaceProps, showModal } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import styles from './contact-list-form.scss';
import {
  contactLivingWithPatient,
  hivStatus,
  maritalStatus,
  pnsAproach,
  useRelationshipTypes,
} from './contact-list.resource';

interface ContactListFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
}

const ContactListFormSchema = z.object({
  listingDate: z.date({ coerce: true }),
  firstName: z.string().min(1, 'Required'),
  middleName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  gender: z.enum(['M', 'F']),
  dateOfBirth: z.date({ coerce: true }),
  maritalStatus: z.string(),
  address: z.string(),
  phoneNumber: z.string(),
  relationshipToPatient: z.string().uuid(),
  patient: z.string().uuid(),
  livingWithClient: z.enum(['Y', 'N', 'U']).optional(),
  baselineStatus: z.string().optional(),
  booking: z.date({ coerce: true }).optional(),
  preferedPNSAproach: z.string(),
});

type ContactListFormType = z.infer<typeof ContactListFormSchema>;

const ContactListForm: React.FC<ContactListFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  handlePostResponse,
  patientUuid,
}) => {
  const form = useForm<ContactListFormType>({
    defaultValues: {
      address: '',
      firstName: '',
      middleName: '',
      lastName: '',
      maritalStatus: '',
      listingDate: new Date(),
      dateOfBirth: new Date(),
      patient: '',
      relationshipToPatient: 'a8058424-5ddf-4ce2-a5ee-6e08d01b5960',
    },
    resolver: zodResolver(ContactListFormSchema),
  });
  const { isLoading, error, relationshipTypes } = useRelationshipTypes();
  const observableRel = form.watch('relationshipToPatient');
  const { t } = useTranslation();
  const onSubmit = (values: ContactListFormType) => {};
  const handleCalculateBirthDate = () => {
    const dispose = showModal('birth-date-calculator', {
      onClose: () => dispose(),
      props: { date: new Date(), onBirthDateChange: (date) => form.setValue('dateOfBirth', date) },
    });
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <span className={styles.contactFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <pre>{`${JSON.stringify(form.formState.errors, null, 2)}`}</pre>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Controller
            control={form.control}
            name="listingDate"
            render={({ field }) => (
              <DatePicker dateFormat="d/m/Y" id="listingDate" datePickerType="single" {...field}>
                <DatePickerInput placeholder="mm/dd/yyyy" labelText={t('listingDate', 'Listing Date')} size="xl" />
              </DatePicker>
            )}
          />
        </Column>
        <span className={styles.sectionHeader}>Demographics</span>
        <Column>
          <Controller
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <TextInput {...field} placeholder="First name" labelText={t('firstName', 'First name')} />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <TextInput {...field} placeholder="Middle name" labelText={t('middleName', 'Middle name')} />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <TextInput {...field} placeholder="Last name" labelText={t('lastName', 'Last name')} />
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
                // defaultSelected=""
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
                id="maritalStatus"
                titleText={t('maritalStatus', 'Marital status')}
                {...field}
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
              <TextInput {...field} placeholder="Physical Address/Landmark" labelText={t('address', 'Address')} />
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <TextInput {...field} placeholder="Phone number" labelText={t('phoneNumber', 'Phone number')} />
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
                id="relationshipToPatient"
                titleText={t('relationToPatient', 'Relation to patient')}
                {...field}
                initialSelectedItem={field.value}
                label="Select Realtionship"
                items={relationshipTypes.map((r) => r.uuid)}
                itemToString={(item) => relationshipTypes.find((r) => r.uuid === item)?.displayAIsToB ?? ''}
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
                id="livingWithClient"
                titleText={t('livingWithClient', 'Living with client')}
                {...field}
                initialSelectedItem={field.value}
                label="Select"
                items={contactLivingWithPatient.map((r) => r.value)}
                itemToString={(item) => contactLivingWithPatient.find((r) => r.value === item)?.label ?? ''}
              />
            )}
          />
        </Column>
        <span className={styles.sectionHeader}>Baseline Information</span>

        <Column>
          <Controller
            control={form.control}
            name="baselineStatus"
            render={({ field }) => (
              <Dropdown
                id="baselineStatus"
                titleText={t('baselineStatus', 'HIV Status')}
                {...field}
                initialSelectedItem={field.value}
                label="Select HIV Status"
                items={hivStatus.map((r) => r.value)}
                itemToString={(item) => hivStatus.find((r) => r.value === item)?.label ?? ''}
              />
            )}
          />
        </Column>
        <Column className={styles.facilityColumn}>
          <Controller
            control={form.control}
            name="booking"
            render={({ field }) => (
              <DatePicker datePickerType="single" {...field}>
                <DatePickerInput
                  placeholder="mm/dd/yyyy"
                  labelText={t('bookingDate', 'Booking date')}
                  size="xl"
                  className={styles.datePickerInput}
                />
              </DatePicker>
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="preferedPNSAproach"
            render={({ field }) => (
              <Dropdown
                id="preferedPNSAproach"
                titleText={t('preferedPNSAproach', 'Prefered PNS Aproach')}
                {...field}
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
        <Button className={styles.button} kind="primary" type="submit">
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ContactListForm;
