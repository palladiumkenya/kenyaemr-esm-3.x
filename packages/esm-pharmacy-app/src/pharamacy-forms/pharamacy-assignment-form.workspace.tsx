import { Button, ButtonSet, Column, Form, RadioButton, RadioButtonGroup, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, showSnackbar, showToast } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { Autosuggest } from '../autosuggest/autosuggest.component';
import { fetchPerson, fetchUser, pharmacyAssignmentFormSchema, saveMapping } from '../pharmacy.resources';
import styles from './pharmacy-assignment-form.scss';

type FormType = z.infer<typeof pharmacyAssignmentFormSchema>;

interface PharmacyAssignmentFormProps extends DefaultWorkspaceProps {
  type: 'org.openmrs.User' | 'org.openmrs.Patient';
  pharmacyUuid: string;
}

const PharmacyAssignmentForm: React.FC<PharmacyAssignmentFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  type,
  pharmacyUuid,
}) => {
  const form = useForm<FormType>({
    defaultValues: {
      basisIdentifier: pharmacyUuid,
      entityIdentifier: '',
      entityType: type,
    },
    resolver: zodResolver(pharmacyAssignmentFormSchema),
  });
  const { t } = useTranslation();
  const onSubmit = async (values: FormType) => {
    try {
      const message = await saveMapping(values);
      showSnackbar({ kind: 'success', subtitle: message, title: 'Success' });
      closeWorkspace();
      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`/ws/rest/v1/datafilter/search?type=${values.entityType}`);
      });
    } catch (error) {
      showSnackbar({ kind: 'error', subtitle: error.message, title: 'Failure', isLowContrast: true });
    }
  };

  const searchPatient = async (query: string) => {
    const abortController = new AbortController();
    return await fetchPerson(query, abortController);
  };

  const searchUser = async (query: string) => {
    const abortController = new AbortController();
    return await fetchUser(query, abortController);
  };

  const observableEntityType = form.watch('entityType');
  return (
    <Form style={{ height: '100%' }} onSubmit={form.handleSubmit(onSubmit, (err) => console.error(err))}>
      <span className={styles.contactFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Controller
            control={form.control}
            name="entityType"
            render={({ field }) => (
              <RadioButtonGroup
                className={styles.radioButtonGroup}
                legendText={t('entityType', 'Entity Type')}
                {...field}
                defaultSelected={field.value}
                invalid={form.formState.errors[field.name]?.message}
                invalidText={form.formState.errors[field.name]?.message}>
                <RadioButton labelText={t('user', 'User')} value="org.openmrs.User" id="org.openmrs.User" />
                <RadioButton labelText={t('user', 'Patient')} value="org.openmrs.Patient" id="org.openmrs.Patient" />
              </RadioButtonGroup>
            )}
          />
        </Column>
        <Column>
          <Controller
            control={form.control}
            name="entityIdentifier"
            render={({ field }) => (
              <Autosuggest
                className={styles.input}
                labelText={t('fullName', 'Full name')}
                placeholder={t('fullNamePlaceHolder', 'Firstname Familyname')}
                invalid={Boolean(form.formState.errors[field.name]?.message)}
                invalidText={form.formState.errors[field.name]?.message}
                getDisplayValue={(item) =>
                  observableEntityType == 'org.openmrs.Patient' ? item.display : item.person.display
                }
                getFieldValue={(item) => item.uuid}
                getSearchResults={observableEntityType == 'org.openmrs.Patient' ? searchPatient : searchUser}
                onClear={() => field.onChange('')}
                onSuggestionSelected={(field_, value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
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

export default PharmacyAssignmentForm;
