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
import { useForm } from 'react-hook-form';
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

  const observableDob = form.watch('dateOfBirth');

  const { t } = useTranslation();
  const onSubmit = (values: ContactListFormType) => {};
  const handleCalculateBirthDate = () => {
    const dispose = showModal('birth-date-calculator', {
      onClose: () => dispose(),
      props: { date: observableDob },
      //props to pass in to the modal component
    });
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <span className={styles.contactFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      {`${observableDob}`}
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Layer>
            <DatePicker datePickerType="single">
              <DatePickerInput
                placeholder="mm/dd/yyyy"
                labelText={t('listingDate', 'Listing Date')}
                size="xl"
                {...form.register('listingDate')}
              />
            </DatePicker>
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <TextInput
              {...form.register('firstName')}
              placeholder="first name"
              labelText={t('firstName', 'First name')}
            />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <TextInput
              {...form.register('middleName')}
              placeholder="middle name"
              labelText={t('middleName', 'Middle name')}
            />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <TextInput {...form.register('lastName')} placeholder="lst name" labelText={t('lastName', 'Last name')} />
          </Layer>
        </Column>
        <Row>
          <Column className={styles.facilityColumn}>
            <Layer className={styles.input}>
              <DatePicker datePickerType="single">
                <DatePickerInput
                  placeholder="mm/dd/yyyy"
                  labelText={t('dateOfBirth', 'Date of birth')}
                  size="xl"
                  className={styles.datePickerInput}
                  {...form.register('dateOfBirth')}
                />
              </DatePicker>
            </Layer>
          </Column>
          <Button kind="ghost" renderIcon={Calculator} onClick={handleCalculateBirthDate}>
            From Age
          </Button>
        </Row>

        <Column>
          <Layer className={styles.input}>
            <TextInput {...form.register('address')} placeholder="address" labelText={t('address', 'Address')} />
          </Layer>
        </Column>
        <Column>
          <Layer className={styles.input}>
            <TextInput
              {...form.register('phoneNumber')}
              placeholder="phone number"
              labelText={t('phoneNumber', 'Phone number')}
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
