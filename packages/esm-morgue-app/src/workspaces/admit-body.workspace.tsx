import { Column, Form, Stack } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Autosuggest } from '../autosuggest/autosuggest.component';
import SearchEmptyState from '../autosuggest/search-empty-state.component';
import styles from './admit-body.scss';
import PatientSearchInfo from '../autosuggest/patient-search-info.component';
import { fetchDeceasedPatient } from '../hook/useDeceasedPatients';

const schema = z.object({
  deceasedPatient: z.string().nonempty('Patient selection is required').uuid('Invalid patient selection'),
});

type AdmitBodyFormInputs = z.infer<typeof schema>;

const AdmitBodyForm: React.FC = () => {
  const { t } = useTranslation();

  const searchPatient = async (query: string) => {
    const abortController = new AbortController();
    return await fetchDeceasedPatient(query, abortController);
  };

  const form = useForm<AdmitBodyFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      deceasedPatient: '',
    },
  });

  const { handleSubmit, control, formState } = form;

  const onSuggestionSelected = (value: string) => {
    if (value) {
      // Handle suggestion selection logic here
    }
  };

  return (
    <Form className={styles.formContainer}>
      <Stack gap={4} className={styles.formGrid}>
        <Column className={styles.searchContainer}>
          <Controller
            control={control}
            name="deceasedPatient"
            render={({ field }) => (
              <Autosuggest
                labelText={t('searchDeceasedPatient', 'Search for a deceased patient')}
                placeholder={t('searchDeceasedPatientPlaceholder', 'Search for a deceased patient')}
                invalid={!!formState.errors[field.name]?.message}
                invalidText={formState.errors[field.name]?.message}
                getDisplayValue={() => ''}
                renderSuggestionItem={(item) => <PatientSearchInfo patient={item.patient} />}
                getFieldValue={(item) => item.patient.uuid}
                getSearchResults={searchPatient}
                renderEmptyState={(value) => (
                  <SearchEmptyState
                    searchValue={value}
                    message={t('deceasedPatientNotFound', 'Deceased Patient Not Found')}
                  />
                )}
                onClear={() => field.onChange('')}
                onSuggestionSelected={(_, value) => {
                  onSuggestionSelected(value);
                  field.onChange(value);
                }}
              />
            )}
          />
        </Column>
      </Stack>
    </Form>
  );
};

export default AdmitBodyForm;
