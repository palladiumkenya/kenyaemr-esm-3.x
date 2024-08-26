import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  MultiSelect,
  ContentSwitcher,
  Tag,
  Switch,
  PasswordInput,
  InlineLoading,
  Form,
  Stack,
  TextInput,
  Search,
  ComboBox,
  Row,
  Tile,
} from '@carbon/react';
import { showModal, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod'; // Import Zod
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './provider-form.scss';
import { GenderFemale, GenderMale, Query } from '@carbon/react/icons';
import { searchHealthCareWork, useFacility, useHWR, useIdentifierTypes, useRoles } from './hook/provider-form.resource';
import { Facility, Practitioner } from '../types';
import { ConfigObject } from '../config-schema';

const providerFormSchema = z
  .object({
    surname: z.string().nonempty('Surname is required'),
    firstname: z.string().nonempty('First name is required'),
    nationalid: z.string().nonempty('National ID is required'),
    gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
    licenseNumber: z.string().nonempty('License number is required'),
    licenseExpiryDate: z.string().nonempty('License expiry date is required'),
    username: z.string().nonempty('Username is required'),
    password: z.string().nonempty('Password is required'),
    confirmPassword: z.string().nonempty('Confirm password is required'),
    roles: z.array(z.string()).min(1, 'At least one role is required'),
    providerId: z.string().nonempty('Provider ID is required'),
    primaryFacility: z.string().nonempty('Primary facility is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const ProviderForm: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const controlSize = layout === 'tablet' ? 'xl' : 'sm';
  const { providerIdentifierTypes } = useIdentifierTypes();
  const { roles, isLoading: isLoadingRoles } = useRoles();
  const [facilitySearchTerm, setFacilitySearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [searchHWR, setSearchHWR] = useState({
    identifierType: '49af6cdc-7968-4abb-bf46-de10d7f4859f',
    identifier: '',
    isHWRLoading: false,
  });
  const { data: facilities } = useFacility(facilitySearchTerm);
  const definedRoles = roles.map((role) => ({ id: role.uuid, text: role.display })) || [];
  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(providerFormSchema),
  });
  const handleFacilitySearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFacilitySearchTerm(event.target.value);
  };

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility);
    setFacilitySearchTerm('');
  };

  const handleRemoveFacility = () => {
    setSelectedFacility(null);
  };
  const defualtValueCombox = providerIdentifierTypes?.find((item) => item.display === searchHWR.identifierType);
  const handleSearch = async () => {
    try {
      setSearchHWR({ ...searchHWR, isHWRLoading: true });
      const healthWorker: Practitioner = await searchHealthCareWork(searchHWR.identifierType, searchHWR.identifier);
      const nationalId = healthWorker?.identifier?.find((id) =>
        id.type?.coding?.some((code) => code.code === 'national-id'),
      )?.value;
      const licenseNumber =
        healthWorker?.qualification?.[0]?.extension?.find(
          (ext) => ext.url === 'https://shr.tiberbuapps.com/fhir/StructureDefinition/current-license-number',
        )?.valueString || 'Unknown';
      healthWorker?.active;
      const dispose = showModal('hwr-confirmation-modal', {
        healthWorker,
        onConfirm: () => {
          dispose();
          setValue('surname', `${healthWorker?.name?.[0]?.family}`);
          setValue('firstname', healthWorker?.name?.[0]?.given?.[0]);
          setValue('nationalid', nationalId);
          setValue('licenseNumber', licenseNumber);
          setValue('active', healthWorker?.active);
        },
      });
    } catch (error) {
      showModal('hwr-empty-modal');
    } finally {
      setSearchHWR({ ...searchHWR, isHWRLoading: false });
    }
  };
  const onSubmit = async (data: any) => {
    try {
      showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Account created successfully!' });
    } catch (error) {
      showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error creating an account' });
    }
  };

  return (
    <Form onSubmit={handleSubmit(() => {})} className={styles.form__container}>
      <Stack gap={4} className={styles.form__grid}>
        <span className={styles.form__header__section}>
          {t('healthWorkVerify', 'Health worker registry verification')}
        </span>
        {searchHWR.isHWRLoading ? (
          <InlineLoading
            className={styles.form__loading}
            active={searchHWR.isHWRLoading}
            description={t('pullDetailsfromHWR', 'Pulling health worker details........')}
          />
        ) : (
          <>
            <Column>
              <ComboBox
                onChange={({ selectedItem }) => {
                  setSearchHWR({ ...searchHWR, identifierType: selectedItem?.display ?? '' });
                }}
                id="form__identifier__type"
                titleText={t('identificationType', 'Identification Type')}
                placeholder={t('chooseIdentifierType', 'Choose identifier type')}
                initialSelectedItem={defualtValueCombox}
                items={providerIdentifierTypes ?? []}
                itemToString={(item) => (item ? item.display : '')}
              />
            </Column>
            <Column>
              <span className={styles.form__gender}>{t('identifierNumber', 'Identifier number*')}</span>
              <Row className={styles.form__row}>
                <Search
                  className={styles.form__search}
                  defaultValue={searchHWR.identifier}
                  placeholder={t('enterIdentifierNumber', 'Enter identifier number')}
                  id="form__search__health__workers"
                  onChange={(value) => {
                    setSearchHWR({ ...searchHWR, identifier: value.target.value });
                  }}
                />
                <Button
                  kind="secondary"
                  size="md"
                  renderIcon={Query}
                  hasIconOnly
                  className={styles.form__search_button}
                  onClick={handleSearch}
                />
              </Row>
            </Column>
          </>
        )}

        <span className={styles.form__subheader__section}>{t('personinfo', 'Person info')}</span>
        <Column>
          <Controller
            name="surname"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder="surname"
                id="form__surname"
                labelText={t('surname', 'Surname*')}
                invalid={!!errors.surname}
                invalidText={errors.surname?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            name="firstname"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                id="form__firstname"
                placeholder="firstname"
                labelText={t('firstname', 'First name*')}
                invalid={!!errors.firstname}
                invalidText={errors.firstname?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            name="nationalid"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                id="form__national__id"
                placeholder="National ID"
                labelText={t('nationalID', 'National ID*')}
                invalid={!!errors.firstname}
                invalidText={errors.firstname?.message}
              />
            )}
          />
        </Column>
        <Column>
          <span className={styles.form__gender}>{t('gender', 'Gender*')}</span>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <ContentSwitcher id="form__content_switch" onChange={({ name }) => field.onChange(name)}>
                <Switch
                  name="male"
                  text={
                    <>
                      <GenderMale /> Male
                    </>
                  }
                  selected={field.value === 'male'}
                />
                <Switch
                  name="female"
                  text={
                    <>
                      <GenderFemale /> Female
                    </>
                  }
                  selected={field.value === 'female'}
                />
              </ContentSwitcher>
            )}
          />
          {errors.gender && <div className={styles.error_message}>{String(errors.gender?.message)}</div>}
        </Column>
        <Column>
          <Controller
            name="licenseNumber"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder="license number"
                id="form__license_number"
                labelText={t('licenseNumber', 'License number*')}
                invalid={!!errors.licenseNumber}
                invalidText={errors.licenseNumber?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            name="licenseExpiryDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                datePickerType="single"
                className={styles.form__date__picker}
                onChange={(date) => field.onChange(date[0])}>
                <DatePickerInput
                  className={styles.form__date__picker}
                  placeholder="mm/dd/yyyy"
                  labelText="License expiry date*"
                  id="form__license_date_picker"
                  size="md"
                  invalid={!!errors.licenseExpiryDate}
                  invalidText={errors.licenseExpiryDate?.message}
                />
              </DatePicker>
            )}
          />
        </Column>
        <span className={styles.form__subheader__section}>{t('loginIn', 'Login info')}</span>
        <Column>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder="Username"
                id="form__username"
                labelText={t('username', 'Username*')}
                invalid={!!errors.username}
                invalidText={errors.username?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                id="form__password"
                placeholder="Password"
                labelText={t('password', 'Password*')}
                invalid={!!errors.password}
                invalidText={errors.password?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                id="form__confirm__password"
                placeholder="Confirm password"
                labelText={t('confirmPasword', 'Confirm password*')}
                invalid={!!errors.confirmPassword}
                invalidText={errors.confirmPassword?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <MultiSelect
                {...field}
                label={<span className={styles.form__role_label}>Roles</span>}
                id="form__roles"
                titleText="Roles*"
                items={definedRoles}
                itemToString={(item) => (item ? item.text : '')}
                selectionFeedback="top-after-reopen"
                invalid={!!errors.roles}
                invalidText={errors.roles?.message}
              />
            )}
          />
        </Column>
        <Column>
          <span className={styles.form__gender}>{t('primaryFacility', 'Primary facility*')}</span>
          <br />
          {selectedFacility && (
            <Tag
              key={selectedFacility.uuid}
              type="high-contrast"
              onClick={handleRemoveFacility}
              role="button"
              tabIndex={0}
              title={selectedFacility.name}>
              {selectedFacility.name} - {selectedFacility.attributes[0]?.value}
            </Tag>
          )}
          <br />
          <Controller
            name="primaryFacility"
            control={control}
            render={({ field }) => {
              const isSearchDisabled = !!selectedFacility;
              return (
                <>
                  <Search
                    {...field}
                    size="lg"
                    placeholder="Primary facility"
                    labelText="Search"
                    closeButtonLabelText="Clear"
                    id="facility-search"
                    value={facilitySearchTerm}
                    onChange={handleFacilitySearchChange}
                    invalid={!!errors.primaryFacility}
                    invalidText={errors.primaryFacility?.message}
                    disabled={isSearchDisabled}
                  />
                  {facilitySearchTerm && facilities && (
                    <div className={styles.facilityList}>
                      {facilities.map((facility) => (
                        <Tile
                          key={facility.uuid}
                          className={styles.facilityTag}
                          type="blue"
                          onClick={() => handleFacilitySelect(facility)}
                          role="button"
                          tabIndex={0}
                          title={facility.name}>
                          {facility.name} - {facility.attributes[0]?.value}
                        </Tile>
                      ))}
                    </div>
                  )}
                </>
              );
            }}
          />
        </Column>
        <Column>
          <Controller
            name="providerId"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder="Provider ID"
                id="form__provide__id"
                labelText={t('providerId', 'Provider ID*')}
                invalid={!!errors.providerId}
                invalidText={errors.providerId?.message}
              />
            )}
          />
        </Column>
      </Stack>
      <ButtonSet className={styles.form__button_set}>
        <Button className={styles.form__button} size="sm" kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.form__button} kind="primary" size="sm" type="submit">
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ProviderForm;
