import {
  Button,
  ButtonSet,
  Column,
  ComboBox,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  Form,
  InlineLoading,
  Loading,
  MultiSelect,
  PasswordInput,
  Row,
  Search,
  Stack,
  Switch,
  TextInput,
} from '@carbon/react';
import { GenderFemale, GenderMale, Query } from '@carbon/react/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  formatDate,
  parseDate,
  restBaseUrl,
  showModal,
  showSnackbar,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { Facility, Practitioner, ProviderResponse, User } from '../types';
import {
  createProvider,
  createProviderAttribute,
  createUser,
  searchHealthCareWork,
  updateProviderAttributes,
  updateProviderPerson,
  updateProviderUser,
  useFacility,
  useIdentifierTypes,
  useRoles,
} from './hook/provider-form.resource';
import styles from './provider-form.scss';
import { HWR_API_NO_CREDENTIALS, RESOURCE_NOT_FOUND, UNKNOWN } from '../constants';

const providerFormSchema = z
  .object({
    surname: z.string().nonempty('Surname is required'),
    firstname: z.string().nonempty('First name is required'),
    nationalid: z.string().optional(),
    gender: z.enum(['M', 'F'], { required_error: 'Gender is required' }),
    licenseNumber: z.string().optional(),
    registrationNumber: z.string().optional(),
    phoneNumber: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .optional(),
    qualification: z.string().optional(),
    providerAddress: z.string().optional(),
    passportNumber: z.string().optional(),
    licenseExpiryDate: z.date().optional(),
    username: z.string().nonempty('Username is required'),
    password: z.string().nonempty('Password is required'),
    confirmPassword: z.string().nonempty('Confirm password is required'),
    roles: z.array(z.string()).min(1, 'At least one role is required'),
    providerId: z.string().nonempty('Provider ID is required'),
    primaryFacility: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

interface ProvideModalProps {
  closeWorkspace: () => void;
  provider?: ProviderResponse;
  user?: User;
}
const ProviderForm: React.FC<ProvideModalProps> = ({ closeWorkspace, provider, user }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const controlSize = layout === 'tablet' ? 'xl' : 'sm';
  const { roles, isLoading: isLoadingRoles } = useRoles();
  const {
    nationalIDUuid,
    providerNationalIdUuid,
    licenseExpiryDateUuid,
    licenseNumberUuid,
    licenseBodyUuid,
    identifierTypes,
    providerHieFhirReference,
    phoneNumberUuid,
    qualificationUuid,
    providerAddressUuid,
  } = useConfig<ConfigObject>();

  const [searchHWR, setSearchHWR] = useState({
    identifierType: identifierTypes[0]?.key ?? '',
    identifier: '',
    isHWRLoading: false,
  });
  const [healthWorker, setHealthWorker] = useState(null);
  const definedRoles = roles.map((role) => role.uuid) || [];
  const licenseDate = provider?.attributes?.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid)?.value;

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      surname: provider?.person?.display?.split(' ').at(-1),
      firstname: provider?.person?.display?.split(' ').at(0),
      nationalid: provider?.attributes?.find((attr) => attr.attributeType.uuid === providerNationalIdUuid)?.value,
      gender: provider?.person?.gender ?? 'M',
      licenseNumber: provider?.attributes?.find((attr) => attr.attributeType.uuid === licenseNumberUuid)?.value,
      registrationNumber: provider?.attributes?.find((attr) => attr.attributeType.uuid === licenseBodyUuid)?.value,
      phoneNumber: provider?.attributes?.find((attr) => attr.attributeType.uuid === phoneNumberUuid)?.value,
      qualification: provider?.attributes?.find((attr) => attr.attributeType.uuid === qualificationUuid)?.value,
      providerAddress: provider?.attributes?.find((attr) => attr.attributeType.uuid === providerAddressUuid)?.value,
      licenseExpiryDate: licenseDate ? parseDate(licenseDate) : undefined,
      username: user?.username,
      password: provider ? '*****' : '',
      confirmPassword: provider ? '*****' : '',
      roles: user?.allRoles?.map((role) => role.uuid) ?? [],
      providerId: provider?.identifier,
    },
  });

  const defaultIdentifierType = identifierTypes.find((item) => item.key === searchHWR.identifierType);
  const handleSearch = async () => {
    try {
      setSearchHWR({ ...searchHWR, isHWRLoading: true });
      const fetchedHealthWorker: Practitioner = await searchHealthCareWork(
        searchHWR.identifierType,
        searchHWR.identifier,
      );

      if (!fetchedHealthWorker?.entry || fetchedHealthWorker.entry.length === 0) {
        showModal('hwr-empty-modal', { errorCode: t('noResults', 'No results found') });
        return;
      }

      const dispose = showModal('hwr-confirmation-modal', {
        healthWorker: fetchedHealthWorker,
        onConfirm: () => {
          dispose();
          setValue('surname', fetchedHealthWorker?.entry[0]?.resource?.name[0]?.text.split(' ').pop());
          setValue(
            'firstname',
            fetchedHealthWorker?.entry[0]?.resource?.name[0]?.text.split(' ').slice(0, -1).join(' '),
          );
          setValue(
            'nationalid',
            fetchedHealthWorker?.entry[0]?.resource?.identifier?.find((id) =>
              id.type?.coding?.some((code) => code.code === 'national-id'),
            )?.value,
          );
          setValue(
            'licenseNumber',
            fetchedHealthWorker?.entry[0]?.resource?.identifier?.find((id) =>
              id.type?.coding?.some((code) => code.code === 'license-number'),
            )?.value,
          );
          setValue(
            'registrationNumber',
            fetchedHealthWorker?.entry[0]?.resource?.identifier?.find((id) =>
              id.type?.coding?.some((code) => code.code === 'board-registration-number'),
            )?.value,
          );
          setValue(
            'phoneNumber',
            fetchedHealthWorker?.entry[0]?.resource?.telecom?.find((contact) => contact.system === 'phone')?.value ||
              '',
          );

          setValue(
            'qualification',
            fetchedHealthWorker?.entry[0]?.resource?.qualification?.[0]?.code?.coding?.[0]?.display ||
              fetchedHealthWorker?.entry[0]?.resource?.extension?.find(
                (ext) => ext.url === 'https://ts.kenya-hie.health/Codesystem/specialty',
              )?.valueCodeableConcept?.coding?.[0]?.display ||
              '',
          );
          setValue(
            'providerAddress',
            fetchedHealthWorker?.entry[0]?.resource?.telecom?.find((contact) => contact.system === 'email')?.value ||
              '',
          );

          setValue(
            'licenseExpiryDate',
            parseDate(
              fetchedHealthWorker?.entry[0]?.resource?.identifier?.find((id) =>
                id.type?.coding?.some((code) => code.code === 'license-number'),
              )?.period?.end || t('unknown', 'Unknown'),
            ),
          );
          setHealthWorker(fetchedHealthWorker);
        },
      });
    } catch (error) {
      showModal('hwr-empty-modal', { errorCode: error.message });
    } finally {
      setSearchHWR({ ...searchHWR, isHWRLoading: false });
    }
  };
  const onSubmit = async (data) => {
    try {
      const personPayload = {
        names: [
          {
            givenName: data.firstname,
            familyName: data.surname,
          },
        ],
        gender: data.gender,
      };

      const userPayload = {
        username: data.username,
        password: data.password,
        person: personPayload,
        roles: data.roles,
      };

      let updatedOrCreatedUser;

      if (provider) {
        const userUpdateResponse = await updateProviderUser({ roles: userPayload.roles }, user.uuid);
        const personUpdateResponse = await updateProviderPerson(personPayload, user.person.uuid);
        updatedOrCreatedUser = await userUpdateResponse.json();
        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/provider`));

        showSnackbar({
          title: t('accountUpdated', 'Account Updated'),
          kind: 'success',
          subtitle: t('accountUpdatedMsg', 'Account updated successfully!'),
        });
      } else {
        const userCreationResponse = await createUser(userPayload);
        updatedOrCreatedUser = await userCreationResponse.json();
        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/provider`));

        showSnackbar({
          title: t('personCreated', 'Person Created'),
          kind: 'success',
          subtitle: t('personCreatedMsg', 'Person created successfully!'),
        });
      }

      const providerPayload = {
        person: updatedOrCreatedUser.person.uuid,
        identifier: data.providerId,
        attributes: [],
        retired: false,
      };

      const attributeMappings = [
        { field: 'nationalid', uuid: providerNationalIdUuid },
        {
          field: 'licenseExpiryDate',
          uuid: licenseExpiryDateUuid,
          transform: (value) => new Date(value).toISOString(),
        },
        { field: 'licenseNumber', uuid: licenseNumberUuid },
        { field: 'registrationNumber', uuid: licenseBodyUuid },
        { field: 'phoneNumber', uuid: phoneNumberUuid },
        { field: 'qualification', uuid: qualificationUuid },
        { field: 'providerAddress', uuid: providerAddressUuid },
      ];

      attributeMappings.forEach(({ field, uuid, transform }) => {
        if (data[field]) {
          providerPayload.attributes.push({
            attributeType: uuid,
            value: transform ? transform(data[field]) : data[field],
          });
        }
      });

      if (healthWorker) {
        providerPayload.attributes.push({
          attributeType: providerHieFhirReference,
          value: JSON.stringify(healthWorker),
        });
      }

      if (provider) {
        const updatableAttributes = [
          providerNationalIdUuid,
          licenseBodyUuid,
          licenseNumberUuid,
          licenseExpiryDateUuid,
          phoneNumberUuid,
          qualificationUuid,
          providerAddressUuid,
        ];

        await Promise.all(
          providerPayload.attributes
            .filter((attr) => updatableAttributes.includes(attr.attributeType))
            .map((attr) => {
              const existingAttribute = provider.attributes.find(
                (at) => at.attributeType.uuid === attr.attributeType,
              )?.uuid;

              if (existingAttribute) {
                return updateProviderAttributes({ value: attr.value }, provider.uuid, existingAttribute);
              } else if (attr.value !== null && attr.value !== undefined) {
                return createProviderAttribute(attr, provider.uuid);
              }
              return Promise.resolve();
            }),
        );

        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/provider`));
        showSnackbar({
          title: t('accountUpdated', 'Account Updated'),
          kind: 'success',
          subtitle: t('accountUpdatedMsg', 'Account updated successfully!'),
        });
      } else {
        const providerCreationResponse = await createProvider(providerPayload);
        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/provider`));
        showSnackbar({
          title: t('accountCreated', 'Account Created'),
          kind: 'success',
          subtitle: t('accountCreatedMsg', 'Account created successfully!'),
        });
      }

      closeWorkspace();
    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar({
        title: t('failure', 'Failure'),
        kind: 'error',
        subtitle: t('errorMsg', `Error ${provider ? 'updating' : 'creating'} provider! {{message}}`, {
          message: error?.responseBody?.error?.message,
        }),
      });
    }
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
      <Stack gap={4} className={styles.formGrid}>
        <span className={styles.formHeaderSection}>{t('healthWorkVerify', 'Health worker registry verification')}</span>
        {searchHWR.isHWRLoading ? (
          <InlineLoading
            className={styles.formLoading}
            active={searchHWR.isHWRLoading}
            description={t('pullDetailsfromHWR', 'Pulling health worker details........')}
          />
        ) : (
          <>
            <Column>
              <ComboBox
                onChange={({ selectedItem }) => {
                  setSearchHWR({ ...searchHWR, identifierType: selectedItem?.key ?? '' });
                }}
                id="formIdentifierType"
                titleText={t('identificationType', 'Identification Type')}
                placeholder={t('chooseIdentifierType', 'Choose identifier type')}
                initialSelectedItem={defaultIdentifierType}
                items={identifierTypes}
                itemToString={(item) => (item ? item.name : '')}
              />
            </Column>
            <Column>
              <span className={styles.formGender}>{t('identifierNumber', 'Identifier number*')}</span>
              <Row className={styles.formRow}>
                <Search
                  className={styles.formSearch}
                  defaultValue={searchHWR.identifier}
                  placeholder={t('enterIdentifierNumber', 'Enter identifier number')}
                  id="formSearchHealthWorkers"
                  onChange={(value) => {
                    setSearchHWR({ ...searchHWR, identifier: value.target.value });
                  }}
                />
                <Button
                  kind="secondary"
                  size="md"
                  renderIcon={Query}
                  hasIconOnly
                  className={styles.formSearchButton}
                  onClick={handleSearch}
                />
              </Row>
            </Column>
          </>
        )}
        <span className={styles.formSubheaderSection}>{t('personinfo', 'Person info')}</span>
        <Column>
          <Controller
            name="surname"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder={t('surnamePlaceholder', 'surname')}
                id="formSurname"
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
                id="formFirstname"
                placeholder={t('firstnamePlaceholder', 'First name')}
                labelText={t('firstname', 'First name*')}
                invalid={!!errors.firstname}
                invalidText={errors.firstname?.message}
              />
            )}
          />
        </Column>
        <Controller
          name="nationalid"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              id="formNationalId"
              placeholder={t('nationalIdPlaceholder', 'Enter National ID')}
              labelText={t('nationalID', 'National ID')}
              disabled={!provider}
              invalid={!!errors.nationalid}
              invalidText={errors.nationalid?.message}
            />
          )}
        />

        <Column>
          <span className={styles.formGender}>{t('gender', 'Gender*')}</span>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <ContentSwitcher
                selectedIndex={field.value && field.value == 'M' ? 0 : 1}
                onChange={({ name }) => field.onChange(name)}>
                <Switch
                  name="M"
                  text={
                    <>
                      <GenderMale /> {t('male', 'Male')}
                    </>
                  }
                />
                <Switch
                  name="F"
                  text={
                    <>
                      <GenderFemale /> {t('female', 'Female')}
                    </>
                  }
                />
              </ContentSwitcher>
            )}
          />
          {errors.gender && <div className={styles.errorMessage}>{String(errors.gender?.message)}</div>}
        </Column>
        {provider && (
          <>
            <Column>
              <Controller
                name="licenseNumber"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    placeholder={t('licenseNumberPlaceholder', 'License number')}
                    disabled={!provider}
                    id="formLicenseNumber"
                    labelText={t('licenseNumber', 'License number*')}
                    invalid={!!errors.licenseNumber}
                    invalidText={errors.licenseNumber?.message}
                  />
                )}
              />
            </Column>
            <Column>
              <Controller
                name="registrationNumber"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    placeholder={t('registrationNumberPlaceholder', 'Registration number')}
                    id="formRegistrationNumber"
                    labelText={t('registrationNumber', 'Registration number*')}
                    disabled={!provider}
                    invalid={!!errors.registrationNumber}
                    invalidText={errors.registrationNumber?.message}
                  />
                )}
              />
            </Column>
          </>
        )}
        <Column>
          <Controller
            name="licenseExpiryDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                datePickerType="single"
                className={styles.formDatePicker}
                onChange={(event) => {
                  if (event.length) {
                    field.onChange(event[0]);
                  }
                }}
                value={field.value}>
                <DatePickerInput
                  className={styles.formDatePicker}
                  placeholder="mm/dd/yyyy"
                  labelText="License expiry date*"
                  id="formLicenseDatePicker"
                  size="md"
                  disabled
                  invalid={!!errors.licenseExpiryDate}
                  invalidText={errors.licenseExpiryDate?.message}
                />
              </DatePicker>
            )}
          />
        </Column>
        <Column>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder={t('phoneNumber', 'Phone number')}
                disabled
                id="phoneNumber"
                labelText={t('phoneNumber', 'Phone number')}
                invalid={!!errors.phoneNumber}
                invalidText={errors.phoneNumber?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            name="providerAddress"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder={t('emailAddress', 'Email address')}
                disabled
                id="emailAddress"
                labelText={t('emailAddress', 'Email address')}
                invalid={!!errors?.providerAddress}
                invalidText={errors?.providerAddress?.message}
              />
            )}
          />
        </Column>
        <Column>
          <Controller
            name="qualification"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder={t('qualification', 'Qualification')}
                disabled
                id="qualification"
                labelText={t('qualification', 'Qualification')}
                invalid={!!errors.qualification}
                invalidText={errors.qualification?.message}
              />
            )}
          />
        </Column>
        {!provider ? (
          <span className={styles.formSubheaderSection}>{t('loginIn', 'Login info')}</span>
        ) : (
          <span className={styles.formSubheaderSection}>{t('rolesHeader', 'Roles info')}</span>
        )}

        <Column>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder={t('username', 'Username')}
                id="formUsername"
                labelText={t('username', 'Username*')}
                invalid={!!errors.username}
                invalidText={errors.username?.message}
              />
            )}
          />
        </Column>
        {!provider && (
          <>
            <Column>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    id="formPassword"
                    placeholder={t('password', 'Password')}
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
                    id="formConfirmPassword"
                    placeholder={t('confirmPassword', 'Confirm password')}
                    labelText={t('confirmPasword', 'Confirm password')}
                    invalid={!!errors.confirmPassword}
                    invalidText={errors.confirmPassword?.message}
                  />
                )}
              />
            </Column>
          </>
        )}
        <Column>
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <>
                <MultiSelect
                  ref={field.ref}
                  label={<span className={styles.formRoleLabel}>{t('roles', 'Roles')}</span>}
                  id="formRoles"
                  titleText={t('roles', 'Roles*')}
                  initialSelectedItems={field.value}
                  items={definedRoles}
                  itemToString={(item) => roles.find((r) => r.uuid === item)?.display ?? ''}
                  onChange={({ selectedItems }) => {
                    field.onChange(selectedItems);
                  }}
                  selectionFeedback="top-after-reopen"
                  invalid={!!errors.roles}
                  invalidText={errors.roles?.message}
                />
              </>
            )}
          />
        </Column>
        {!provider && (
          <>
            <Column>
              <Controller
                name="providerId"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    placeholder={t('providerId', 'Provider ID')}
                    id="formProvideId"
                    labelText={t('providerId', 'Provider ID*')}
                    invalid={!!errors.providerId}
                    invalidText={errors.providerId?.message}
                  />
                )}
              />
            </Column>
          </>
        )}
      </Stack>
      <ButtonSet className={styles.formButtonSet}>
        <Button className={styles.formButton} size="sm" kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.formButton} kind="primary" size="sm" type="submit">
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ProviderForm;
