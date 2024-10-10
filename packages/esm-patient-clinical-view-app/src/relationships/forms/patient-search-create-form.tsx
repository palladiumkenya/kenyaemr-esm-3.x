import { Column } from '@carbon/react';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Autosuggest } from '../../autosuggest/autosuggest.component';
import SearchEmptyState from '../../autosuggest/search-empty-state.component';
import { fetchPerson } from '../relationship.resources';
import styles from './form.scss';

const PatientSearchCreate = () => {
  const form = useFormContext<{ personB: string }>();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const searchPatient = async (query: string) => {
    const abortController = new AbortController();
    return await fetchPerson(query, abortController);
  };

  const handleAdd = () => setMode('create');

  return (
    <>
      {mode === 'search' && (
        <Column>
          <Controller
            control={form.control}
            name="personB"
            render={({ field }) => (
              <Autosuggest
                className={styles.input}
                labelText={t('peer', 'Peer')}
                placeholder={t('patientPlaceHolder', 'Search patient')}
                invalid={Boolean(form.formState.errors[field.name]?.message)}
                invalidText={form.formState.errors[field.name]?.message}
                getDisplayValue={(item) => item.display}
                getFieldValue={(item) => item.uuid}
                getSearchResults={searchPatient}
                renderEmptyState={(value) => (
                  <SearchEmptyState
                    searchValue={value}
                    message={t('patientNotFound', 'Patient Not Found')}
                    onAdd={handleAdd}
                  />
                )}
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
      )}
      {mode === 'create' && (
        <>
          <Column></Column>
        </>
      )}
    </>
  );
};

export default PatientSearchCreate;
