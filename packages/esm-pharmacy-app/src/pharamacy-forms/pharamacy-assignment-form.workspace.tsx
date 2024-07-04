import { Button, ButtonSet, Column, Form, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps, showToast } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Autosuggest } from '../autosuggest/autosuggest.component';
import { fetchPerson, pharmacyAssignmentFormSchema, saveMapping } from '../pharmacy.resources';
import styles from './pharmacy-assignment-form.scss';
import { mutate } from 'swr';

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
      showToast({ kind: 'success', description: message, title: 'Success' });
      closeWorkspace();
      mutate((key) => {
        return typeof key === 'string' && key.startsWith('/ws/rest/v1/datafilter/search');
      });
    } catch (error) {
      showToast({ kind: 'error', description: error.message, title: 'Failure' });
    }
  };

  const searchPerson = async (query: string) => {
    const abortController = new AbortController();
    return await fetchPerson(query, abortController);
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <span className={styles.contactFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={4} className={styles.grid}></Stack>
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
              getDisplayValue={(item) => item.display}
              getFieldValue={(item) => item.uuid}
              getSearchResults={searchPerson}
              onSuggestionSelected={(field_, value) => {
                if (value) {
                  field.onChange(value);
                }
              }}
            />
          )}
        />
      </Column>{' '}
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
