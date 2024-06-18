import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  Layer,
  Row,
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

interface ContactListFormProps extends DefaultWorkspaceProps {
  patientUuid: string;
}

const ContactListFormSchema = z.object({
  listingDate: z.date({ coerce: true }),
  firstName: z.string().min(1, 'Required'),
  middleName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  gender: z.enum(['M', 'F', 'U']),
  dateOfBirth: z.date({ coerce: true }),
  maritalStatus: z.string(),
  address: z.string(),
  phoneNumber: z.string(),
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
      gender: 'U',
      dateOfBirth: new Date(),
    },
    resolver: zodResolver(ContactListFormSchema),
  });

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
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Layer>
            <Controller
              control={form.control}
              name="listingDate"
              render={({ field }) => (
                <DatePicker dateFormat="d/m/Y" id="listingDate" datePickerType="single" {...field}>
                  <DatePickerInput placeholder="mm/dd/yyyy" labelText={t('listingDate', 'Listing Date')} size="xl" />
                </DatePicker>
              )}
            />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <Controller
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <TextInput {...field} placeholder="first name" labelText={t('firstName', 'First name')} />
              )}
            />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <Controller
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <TextInput {...field} placeholder="middle name" labelText={t('middleName', 'Middle name')} />
              )}
            />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <Controller
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <TextInput {...field} placeholder="last name" labelText={t('lastName', 'Last name')} />
              )}
            />
          </Layer>
        </Column>
        <Row>
          <Column className={styles.facilityColumn}>
            <Layer className={styles.input}>
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
            </Layer>
          </Column>
          <Button kind="ghost" renderIcon={Calculator} onClick={handleCalculateBirthDate}>
            From Age
          </Button>
        </Row>

        <Column>
          <Layer className={styles.input}>
            <Controller
              control={form.control}
              name="address"
              render={({ field }) => <TextInput {...field} placeholder="address" labelText={t('address', 'Address')} />}
            />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <Controller
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <TextInput {...field} placeholder="phone number" labelText={t('phoneNumber', 'Phone number')} />
              )}
            />
          </Layer>
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
