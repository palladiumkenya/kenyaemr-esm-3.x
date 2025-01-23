import {
  Button,
  Column,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  Dropdown,
  RadioButton,
  RadioButtonGroup,
  Switch,
  TextInput,
} from '@carbon/react';
import { Calculator } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Autosuggest } from '../../autosuggest/autosuggest.component';
import SearchEmptyState from '../../autosuggest/search-empty-state.component';
import { contactListConceptMap } from '../../contact-list/contact-list-concept-map';
import { fetchPerson, relationshipFormSchema } from '../relationship.resources';
import styles from './form.scss';
import { MARITAL_STATUS_CONCEPT_UUID } from '../relationships-constants';
import PatientSearchInfo from '../../autosuggest/patient-search-info.component';

type PatientSearchCreateProps = {};

const PatientSearchCreate: React.FC<PatientSearchCreateProps> = () => {
  const form = useFormContext<z.infer<typeof relationshipFormSchema>>();
  const { t } = useTranslation();
  const searchPatient = async (query: string) => {
    const abortController = new AbortController();
    return await fetchPerson(query, abortController);
  };

  const handleAdd = () => form.setValue('mode', 'create');
  const maritalStatus = useMemo(
    () =>
      Object.entries(contactListConceptMap[MARITAL_STATUS_CONCEPT_UUID].answers).map(([uuid, display]) => ({
        label: display,
        value: uuid,
      })),
    [],
  );

  const handleCalculateBirthDate = () => {
    const dispose = showModal('birth-date-calculator', {
      onClose: () => dispose(),
      props: { date: new Date(), onBirthDateChange: (date) => form.setValue('personBInfo.birthdate', date) },
    });
  };

  const mode = form.watch('mode');

  return (
    <>
      <Column>
        <Controller
          control={form.control}
          name="mode"
          render={({ field }) => (
            <ContentSwitcher
              selectedIndex={field.value == 'search' ? 0 : 1}
              onChange={(value) => {
                let { index, name, text } = value;
                field.onChange(name);
              }}>
              <Switch name="search" text="Search patient" />
              <Switch name="create" text="Create patient" />
            </ContentSwitcher>
          )}
        />
      </Column>
      {mode === 'search' && (
        <Column>
          <Controller
            control={form.control}
            name="personB"
            render={({ field, fieldState: { error } }) => (
              <Autosuggest
                className={styles.input}
                labelText={t('patient', 'Patient')}
                placeholder={t('patientPlaceHolder', 'Search patient')}
                invalid={Boolean(error?.message)}
                invalidText={error?.message}
                getDisplayValue={(item) => item.person.display}
                renderSuggestionItem={(item) => <PatientSearchInfo patient={item} />}
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
          <span className={styles.sectionHeader}>{t('demographics', 'Demographics')}</span>
          <Column>
            <Controller
              control={form.control}
              name="personBInfo.givenName"
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  invalid={error?.message}
                  invalidText={error?.message}
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
              name="personBInfo.middleName"
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  invalid={error?.message}
                  invalidText={error?.message}
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
              name="personBInfo.familyName"
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  invalid={error?.message}
                  invalidText={error?.message}
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
              name="personBInfo.gender"
              render={({ field, fieldState: { error } }) => (
                <>
                  <RadioButtonGroup
                    name="personBInfo.gender"
                    legendText={t('sex', 'Sex')}
                    {...field}
                    invalid={error?.message}
                    invalidText={error?.message}>
                    <RadioButton labelText={t('male', 'Male')} value="M" id="M" />
                    <RadioButton labelText={t('female', 'Female')} value="F" id="F" />
                  </RadioButtonGroup>
                </>
              )}
            />
          </Column>
          <Column>
            <Controller
              control={form.control}
              name="personBInfo.birthdate"
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  datePickerType="single"
                  {...field}
                  invalid={error?.message}
                  invalidText={error?.message}
                  className={styles.datePickerInput}>
                  <DatePickerInput
                    invalid={error?.message}
                    invalidText={error?.message}
                    placeholder="mm/dd/yyyy"
                    labelText={t('dateOfBirth', 'Date of birth')}
                    size="xl"
                  />
                </DatePicker>
              )}
            />
            <Button kind="ghost" renderIcon={Calculator} onClick={handleCalculateBirthDate}>
              {t('fromAge', 'From Age')}
            </Button>
          </Column>
          <Column>
            <Controller
              control={form.control}
              name="personBInfo.maritalStatus"
              render={({ field, fieldState: { error } }) => (
                <Dropdown
                  ref={field.ref}
                  invalid={error?.message}
                  invalidText={error?.message}
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
          <span className={styles.sectionHeader}>{t('contact', 'Contact')}</span>
          <Column>
            <Controller
              control={form.control}
              name="personBInfo.address"
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  invalid={error?.message}
                  invalidText={error?.message}
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
              name="personBInfo.phoneNumber"
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  {...field}
                  invalid={error?.message}
                  invalidText={error?.message}
                  placeholder="Phone number"
                  labelText={t('phoneNumber', 'Phone number')}
                />
              )}
            />
          </Column>
        </>
      )}
    </>
  );
};

export default PatientSearchCreate;
