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
  MultiSelect,
  PasswordInput,
  Row,
  Search,
  Stack,
  Switch,
  Tag,
  TextInput,
  Tile,
} from '@carbon/react';
import { GenderFemale, GenderMale, Query } from '@carbon/react/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseDate, restBaseUrl, showModal, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { Facility, Practitioner, ProviderResponse, User } from '../types';
import {
  createProvider,
  createUser,
  searchHealthCareWork,
  createProviderAttribute,
  updateProviderAttributes,
  updateProviderPerson,
  updateProviderUser,
  useFacility,
  useIdentifierTypes,
  useRoles,
} from './hook/provider-form.resource';
import styles from './provider-form.scss';
import { mutate } from 'swr';

const providerFormSchema = z
  .object({
    surname: z.string().nonempty('Surname is required'),
    firstname: z.string().nonempty('First name is required'),
    nationalid: z.string().nonempty('National ID is required'),
    gender: z.enum(['M', 'F'], { required_error: 'Gender is required' }),
    licenseNumber: z.string().nonempty('License number is required'),
    licenseExpiryDate: z.date(),
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
  const { providerIdentifierTypes } = useIdentifierTypes();
  const { roles, isLoading: isLoadingRoles } = useRoles();
  const [facilitySearchTerm, setFacilitySearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const { nationalIDUuid, providerNationalIdUuid, licenseExpiryDateUuid, licenseNumberUuid } =
    useConfig<ConfigObject>();

  const [searchHWR, setSearchHWR] = useState({
    identifierType: nationalIDUuid,
    identifier: '',
    isHWRLoading: false,
  });
  const { data: facilities } = useFacility(facilitySearchTerm);
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
      gender: provider?.person?.gender,
      licenseNumber: provider?.attributes?.find((attr) => attr.attributeType.uuid === licenseNumberUuid)?.value,
      licenseExpiryDate: licenseDate ? parseDate(licenseDate) : undefined,
      username: user?.username,
      password: provider ? '*****' : '',
      confirmPassword: provider ? '*****' : '',
      roles: user?.allRoles?.map((role) => role.uuid) ?? [],
      providerId: provider?.identifier,
    },
  });

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
        },
      });
    } catch (error) {
      showModal('hwr-empty-modal');
    } finally {
      setSearchHWR({ ...searchHWR, isHWRLoading: false });
    }
  };
  const onSubmit = async (data) => {
    let response;
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
      let _user;
      if (provider) {
        const userResponse = await updateProviderUser({ roles: userPayload.roles }, user!.uuid);
        response = await updateProviderPerson(personPayload, user!.person.uuid);
        _user = await userResponse.json();
        showSnackbar({
          title: 'Success',
          kind: 'success',
          subtitle: t('accountUpatedMsgs', 'Account updated successfully!'),
        });
      } else {
        response = await createUser(userPayload);
        _user = await response.json();
        showSnackbar({
          title: 'Success',
          kind: 'success',
          subtitle: t('personMsg', 'Person created successfully!'),
        });
      }

      const providerPayload = {
        person: _user.person.uuid,
        identifier: data.providerId,
        attributes: [
          {
            attributeType: providerNationalIdUuid,
            value: data.nationalid,
          },
          {
            attributeType: licenseExpiryDateUuid,
            value: data.licenseExpiryDate.toISOString(),
          },
          {
            attributeType: licenseNumberUuid,
            value: data.licenseNumber,
          },
        ],
        retired: false,
      };
      if (provider) {
        const updatableAttributes = [providerNationalIdUuid, licenseNumberUuid, licenseExpiryDateUuid];
        await Promise.all(
          providerPayload.attributes
            .filter((attr) => updatableAttributes.includes(attr.attributeType))
            .map((attr) => {
              const _attribute = provider.attributes.find((at) => at.attributeType.uuid === attr.attributeType)?.uuid;
              if (!_attribute) {
                return createProviderAttribute(attr, provider.uuid);
              }

              return updateProviderAttributes(
                { value: attr.value },
                provider.uuid,
                provider.attributes.find((at) => at.attributeType.uuid === attr.attributeType)?.uuid,
              );
            }),
        );
        mutate((key) => {
          return typeof key === 'string' && key.startsWith('/ws/rest/v1/provider');
        });
        showSnackbar({
          title: 'Success',
          kind: 'success',
          subtitle: t('accountUpatedMsg', 'Account updated successfully!'),
        });
      } else {
        response = await createProvider(providerPayload);
        mutate((key) => {
          return typeof key === 'string' && key.startsWith('/ws/rest/v1/provider');
        });
        showSnackbar({
          title: 'Success',
          kind: 'success',
          subtitle: t('accountMsg', 'Account created successfully!'),
        });
      }

      closeWorkspace();
    } catch (error) {
      showSnackbar({
        title: 'Failure',
        kind: 'error',
        subtitle: t(
          'errorMsg',
          `Error ${provider ? 'upating' : 'creating'} provider! ${error?.responseBody?.error?.message}`,
        ),
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form__container}>
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
              <ContentSwitcher
                id="form__content_switch"
                selectedIndex={field.value === 'F' ? 1 : 0}
                selectionMode="manual"
                onChange={(event) => field.onChange(event.index === 0 ? 'M' : 'F')}>
                <Switch
                  name="M"
                  text={
                    <>
                      <GenderMale /> Male
                    </>
                  }
                  selected={field.value === 'M'}
                />
                <Switch
                  name="F"
                  text={
                    <>
                      <GenderFemale /> Female
                    </>
                  }
                  selected={field.value === 'F'}
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
                onChange={(event) => {
                  if (event.length) {
                    field.onChange(event[0]);
                  }
                }}
                value={field.value}>
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
        {!provider ? (
          <span className={styles.form__subheader__section}>{t('loginIn', 'Login info')}</span>
        ) : (
          <span className={styles.form__subheader__section}>{t('rolesHeader', 'Roles info')}</span>
        )}

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
        {!provider && (
          <>
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
                  label={<span className={styles.form__role_label}>Roles</span>}
                  id="form__roles"
                  titleText="Roles*"
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
                    placeholder="Provider ID"
                    id="form__provide__id"
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
      <ButtonSet className={styles.form__button_set}>
        <Button className={styles.form__button} size="sm" kind="secondary" onClick={closeWorkspace}>
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
