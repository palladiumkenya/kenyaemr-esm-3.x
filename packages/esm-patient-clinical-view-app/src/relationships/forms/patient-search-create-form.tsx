import {
  Button,
  Column,
  DatePicker,
  DatePickerInput,
  Dropdown,
  RadioButton,
  RadioButtonGroup,
  TextInput,
} from '@carbon/react';
import { Calculator } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import React, { useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Autosuggest } from '../../autosuggest/autosuggest.component';
import SearchEmptyState from '../../autosuggest/search-empty-state.component';
import { contactListConceptMap } from '../../contact-list/contact-list-concept-map';
import { fetchPerson } from '../relationship.resources';
import styles from './form.scss';

const PatientSearchCreate = () => {
  const form = useFormContext<{
    personB: string;
    givenName: string;
    familyName: string;
    middleName: string;
    gender: 'M' | 'F';
    birthdate: Date;
    maritalStatus: string;
    address: string;
    phoneNumber: string;
  }>();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const searchPatient = async (query: string) => {
    const abortController = new AbortController();
    return await fetchPerson(query, abortController);
  };

  const handleAdd = () => setMode('create');
  const maritalStatus = useMemo(
    () =>
      Object.entries(contactListConceptMap['1056AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'].answers).map(([uuid, display]) => ({
        label: display,
        value: uuid,
      })),
    [],
  );

  const handleCalculateBirthDate = () => {
    const dispose = showModal('birth-date-calculator', {
      onClose: () => dispose(),
      props: { date: new Date(), onBirthDateChange: (date) => form.setValue('birthdate', date) },
    });
  };

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
          <span className={styles.sectionHeader}>{t('demographics', 'Demographics')}</span>
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
              name="birthdate"
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
              {t('fromAge', 'From Age')}
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
          <span className={styles.sectionHeader}>{t('contact', 'Contact')}</span>
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
        </>
      )}
    </>
  );
};

export default PatientSearchCreate;
