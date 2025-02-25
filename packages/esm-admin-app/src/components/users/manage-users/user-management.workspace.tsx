import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
  formatDatetime,
  useConfig,
  showModal,
  parseDate,
} from '@openmrs/esm-framework';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import styles from './user-management.workspace.scss';
import {
  TextInput,
  ButtonSet,
  Button,
  InlineLoading,
  Stack,
  RadioButtonGroup,
  RadioButton,
  CheckboxGroup,
  Checkbox,
  PasswordInput,
  Column,
  ProgressIndicator,
  ProgressStep,
  ComboBox,
  DatePickerInput,
  DatePicker,
  Tile,
  Search,
  Row,
} from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import {
  createUser,
  handleMutation,
  useRoles,
  usePersonAttribute,
  useProvider,
  useProviderAttributeType,
  useLocation,
  useStockOperationTypes,
  useStockTagLocations,
  createOrUpdateUserRoleScope,
  createProvider,
  useUserRoleScopes,
} from '../../../user-management.resources';
import UserManagementFormSchema from '../userManagementFormSchema';
import { CardHeader } from '@openmrs/esm-patient-common-lib/src';
import { ChevronSortUp, Query, ChevronRight } from '@carbon/react/icons';
import { useSystemUserRoleConfigSetting } from '../../hook/useSystemRoleSetting';
import { ConfigObject, Provider, User, UserRoleScope } from '../../../config-schema';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, formatNewDate, today } from '../../../constants';
import { type PractitionerResponse } from '../../../types';
import { searchHealthCareWork } from '../../hook/useHWR';

type ManageUserWorkspaceProps = DefaultWorkspaceProps & {
  initialUserValue?: User;
};

const MinDate: Date = today();

const ManageUserWorkspace: React.FC<ManageUserWorkspaceProps> = ({
  closeWorkspace,
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
  initialUserValue = {} as User,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [activeSection, setActiveSection] = useState('demographic');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [healthWorker, setHealthWorker] = useState(null);
  const { provider = [], loadingProvider, providerError } = useProvider(initialUserValue.systemId);
  const { location, loadingLocation } = useLocation();

  const { items, loadingRoleScope } = useUserRoleScopes();

  const { userManagementFormSchema } = UserManagementFormSchema();
  const { stockOperations, loadingStock } = useStockOperationTypes();

  const { stockLocations } = useStockTagLocations();

  const { providerAttributeType = [] } = useProviderAttributeType();

  const { roles = [], isLoading } = useRoles();
  const { rolesConfig, error } = useSystemUserRoleConfigSetting();
  const {
    identifierTypes,
    licenseBodyUuid,
    passportNumberUuid,
    providerHieFhirReference,
    qualificationUuid,
    providerNationalIdUuid,
  } = useConfig<ConfigObject>();
  const [searchHWR, setSearchHWR] = useState({
    identifierType: identifierTypes[0]?.key ?? '',
    identifier: '',
    isHWRLoading: false,
  });
  const defaultIdentifierType = identifierTypes.find((item) => item.key === searchHWR.identifierType);

  const userRoleScope = useMemo(
    () => items?.results?.find((user) => user.userUuid === initialUserValue.uuid) || null,
    [items, initialUserValue.uuid],
  );
  const attributeTypeMapping = useMemo(() => {
    return {
      licenseNumber:
        providerAttributeType.find((type) => type.uuid === 'bcaaa67b-cc72-4662-90c2-e1e992ceda66')?.uuid || '',
      licenseExpiry:
        providerAttributeType.find((type) => type.uuid === '00539959-a1c7-4848-a5ed-8941e9d5e835')?.uuid || '',
      primaryFacility:
        providerAttributeType.find((type) => type.uuid === '5a53dddd-b382-4245-9bf1-03bce973f24b')?.uuid || '',
      providerNationalId: providerAttributeType.find((type) => type.uuid === providerNationalIdUuid)?.uuid || '',
      providerHieFhirReference:
        providerAttributeType.find((type) => type.uuid === providerHieFhirReference)?.uuid || '',
      qualification: providerAttributeType.find((type) => type.uuid === qualificationUuid)?.uuid || '',
      licenseBodyUuid: providerAttributeType.find((type) => type.uuid === licenseBodyUuid)?.uuid || '',
    };
  }, [licenseBodyUuid, providerAttributeType, providerHieFhirReference, providerNationalIdUuid, qualificationUuid]);

  const providerAttributes = useMemo(() => provider.flatMap((item) => item.attributes || []), [provider]);

  const getProviderAttributeValue = useCallback(
    (uuid: string, key = 'value') => providerAttributes.find((attr) => attr.attributeType?.uuid === uuid)?.[key],
    [providerAttributes],
  );

  const providerLicenseNumber = useMemo(
    () => getProviderAttributeValue(attributeTypeMapping.licenseNumber),
    [attributeTypeMapping, getProviderAttributeValue],
  );

  const primaryFacility = useMemo(() => {
    const value = getProviderAttributeValue(attributeTypeMapping.primaryFacility);
    return typeof value === 'object' ? value?.name : value;
  }, [attributeTypeMapping, getProviderAttributeValue]);

  const licenseExpiryDate = useMemo(() => {
    const value = getProviderAttributeValue(attributeTypeMapping.licenseExpiry);
    return value ? new Date(value).toISOString().split('T')[0] : undefined;
  }, [attributeTypeMapping, getProviderAttributeValue]);

  const isInitialValuesEmpty = Object.keys(initialUserValue).length === 0;
  type UserFormSchema = z.infer<typeof userManagementFormSchema>;
  const formDefaultValues = useMemo(() => {
    if (isInitialValuesEmpty) {
      return {};
    }
    return {
      ...initialUserValue,
      ...extractNameParts(initialUserValue.person?.display || ''),
      phoneNumber: extractAttributeValue(initialUserValue.person?.attributes, 'Telephone'),
      email: extractAttributeValue(initialUserValue.person?.attributes, 'Email'),
      roles:
        initialUserValue.roles?.map((role) => ({
          uuid: role.uuid,
          display: role.display,
          description: role.description,
        })) || [],
      gender: initialUserValue.person?.gender,
      providerLicense: providerLicenseNumber,
      licenseExpiryDate: licenseExpiryDate,
      primaryFacility: primaryFacility,
      stockOperation:
        userRoleScope?.operationTypes?.map(({ operationTypeName, operationTypeUuid }) => ({
          operationTypeName,
          operationTypeUuid,
        })) || [],
      operationLocation:
        userRoleScope?.locations?.map(({ locationName, locationUuid }) => ({
          locationName,
          locationUuid,
        })) || [],
      permanent: userRoleScope?.permanent,
      enabled: userRoleScope?.enabled,
      dateRange: {
        activeTo: formatNewDate(userRoleScope?.activeTo),
        activeFrom: formatNewDate(userRoleScope?.activeFrom),
      },
    };
  }, [
    isInitialValuesEmpty,
    initialUserValue,
    providerLicenseNumber,
    licenseExpiryDate,
    primaryFacility,
    userRoleScope,
  ]);

  function extractNameParts(display = '') {
    const nameParts = display.split(' ');

    const [givenName = '', middleName = '', familyName = ''] =
      nameParts.length === 3 ? nameParts : [nameParts[0], '', nameParts[1] || ''];

    return { givenName, middleName, familyName };
  }

  function extractAttributeValue(attributes, prefix: string) {
    return attributes?.find((attr) => attr.display.startsWith(prefix))?.display?.split(' ')[3] || '';
  }

  const userFormMethods = useForm<UserFormSchema>({
    resolver: zodResolver(userManagementFormSchema),
    mode: 'all',
    defaultValues: formDefaultValues,
  });

  const { reset, setValue } = userFormMethods;

  const { errors, isSubmitting, isDirty } = userFormMethods.formState;

  useEffect(() => {
    if (!loadingProvider && !loadingLocation && !loadingRoleScope && !isInitialValuesEmpty) {
      reset(formDefaultValues);
    }
  }, [loadingProvider, loadingLocation, loadingRoleScope, formDefaultValues, isInitialValuesEmpty, reset]);

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => isDirty);
    }
  }, [isDirty, promptBeforeClosing]);

  const handleSearch = async () => {
    try {
      setSearchHWR({ ...searchHWR, isHWRLoading: true });
      const fetchedHealthWorker: PractitionerResponse = await searchHealthCareWork(
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
          const fullName = fetchedHealthWorker?.entry[0]?.resource?.name[0]?.text;

          const nameParts = fullName.split(' ');

          const hasTitle = nameParts[0].endsWith('.');
          const nameWithoutTitle = hasTitle ? nameParts.slice(1) : nameParts;

          const givenName = nameWithoutTitle[0];
          const middleName = nameWithoutTitle.slice(1, -1).join(' ');
          const familyName = nameWithoutTitle[nameWithoutTitle.length - 1];

          setValue('givenName', givenName);
          setValue('middleName', middleName);
          setValue('familyName', familyName);
          setValue(
            'nationalId',
            fetchedHealthWorker?.entry[0]?.resource?.identifier?.find((id) =>
              id.type?.coding?.some((code) => code.code === 'national-id'),
            )?.value,
          );
          setValue(
            'providerLicense',
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
            'email',
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

  const onSubmit = async (data: UserFormSchema) => {
    const emailAttribute = 'b8d0b331-1d2d-4a9a-b741-1816f498bdb6';
    const telephoneAttribute = 'b2c38640-2603-4629-aebd-3b54f33f1e3a';
    const setProvider = data.providerIdentifiers;
    const editProvider = data.isEditProvider;
    const providerUUID = provider[0]?.uuid || '';
    const roleName = data.roles?.[0]?.display || '';

    const hasValidLocations = data.operationLocation?.length > 0;
    const hasEnabledFlag = data.enabled !== undefined && data.enabled !== null;
    const hasOperationTypes = data.stockOperation?.length > 0;
    const hasDateRange = data.dateRange?.activeFrom && data.dateRange?.activeTo;
    const hasValidRoleConditions =
      hasValidLocations && hasEnabledFlag && hasOperationTypes && (data.permanent || hasDateRange);

    const userRoleScopePayload: Partial<UserRoleScope> = {
      ...(hasValidRoleConditions && { role: roleName }),
      locations: data.operationLocation?.map((loc) => ({
        locationUuid: loc.locationUuid,
        locationName: loc.locationName,
        enableDescendants: false,
      })),
      permanent: data.permanent,
      enabled: data.enabled,
      activeFrom: data.dateRange?.activeFrom,
      activeTo: data.dateRange?.activeTo,
      operationTypes: data.stockOperation?.map((op) => ({
        operationTypeUuid: op.operationTypeUuid,
        operationTypeName: op.operationTypeName,
      })),
    };

    const providerPayload: Partial<Provider> = {
      attributes: [
        { attributeType: attributeTypeMapping.primaryFacility, value: data.primaryFacility?.split(' ').pop() || '' },
        { attributeType: attributeTypeMapping.licenseNumber, value: data.providerLicense },
        { attributeType: attributeTypeMapping.licenseExpiry, value: data.licenseExpiryDate.toISOString() },
        { attributeType: attributeTypeMapping.licenseBodyUuid, value: data.registrationNumber },
        { attributeType: attributeTypeMapping.providerHieFhirReference, value: JSON.stringify(healthWorker) },
        {
          attributeType: attributeTypeMapping.providerNationalId,
          value: data.nationalId,
        },
        {
          attributeType: attributeTypeMapping.qualification,
          value: data.qualification,
        },
      ].filter((attr) => attr.value),
    };

    const payload: Partial<User> = {
      username: data.username,
      password: data.password,
      person: {
        names: [{ givenName: data.givenName, familyName: data.familyName, middleName: data.middleName }],
        gender: data.gender,
        attributes: [
          { attributeType: telephoneAttribute, value: data.phoneNumber },
          { attributeType: emailAttribute, value: data.email },
        ],
      },
      roles: data.roles?.map((role) => ({
        uuid: role.uuid,
        name: role.display,
        description: role.description || '',
      })),
    };

    const showSnackbarMessage = (title: string, subtitle: string, kind: 'success' | 'error') => {
      showSnackbar({ title, subtitle, kind, isLowContrast: true });
    };

    try {
      const response = await createUser(payload, initialUserValue?.uuid || '');
      if (response.uuid) {
        showSnackbarMessage(t('userSaved', 'User saved successfully'), '', 'success');

        if (userRoleScopePayload !== null && hasValidRoleConditions) {
          try {
            const userRoleScopeUrl = userRoleScope?.uuid
              ? `${restBaseUrl}/stockmanagement/userrolescope/${userRoleScope.uuid}`
              : `${restBaseUrl}/stockmanagement/userrolescope`;
            const userUuid = response.uuid;

            const userRoleScopeResponse = await createOrUpdateUserRoleScope(
              userRoleScopeUrl,
              userRoleScopePayload,
              userUuid,
            );

            if (userRoleScopeResponse.ok) {
              handleMutation(`${restBaseUrl}/stockmanagement/userrolescope`);
              showSnackbarMessage(t('userRoleScopeSaved', 'User role scope saved successfully'), '', 'success');
            }
          } catch (error) {
            showSnackbarMessage(
              t('userRoleScopeFail', 'Failed to save user role scope'),
              t('userRoleScopeFailedSubtitle', 'An error occurred while creating user role scope{{errorMessage}}', {
                errorMessage: JSON.stringify(error, null, 2),
              }),
              'error',
            );
          }
        }
        if (setProvider || editProvider) {
          try {
            const providerUrl = providerUUID ? `${restBaseUrl}/provider/${providerUUID}` : `${restBaseUrl}/provider`;
            const personUUID = response.person.uuid;
            const identifier = response.systemId;
            const providerResponse = await createProvider(personUUID, identifier, providerPayload, providerUrl);

            if (providerResponse.ok) {
              showSnackbarMessage(t('providerSaved', 'Provider saved successfully'), '', 'success');
            }
          } catch (error) {
            showSnackbarMessage(
              t('providerFail', 'Failed to save provider'),
              t('providerFailedSubtitle', 'An error occurred while creating provider'),
              'error',
            );
          }
        }
      } else {
        throw new Error('User creation failed');
      }
      handleMutation(`${restBaseUrl}/user`);
      closeWorkspaceWithSavedChanges();
    } catch (error) {
      showSnackbarMessage(
        t('userSaveFailed', 'Failed to save user'),
        t('userCreationFailedSubtitle', 'An error occurred while saving user form '),
        'error',
      );
    }
  };

  const handleError = (error, response) => {
    showSnackbar({
      title: t('userSaveFailed', 'Fail to save {{error}}', response),
      subtitle: t('userCreationFailedSubtitle', 'An error occurred while creating user {{errorMessage}}', {
        errorMessage: JSON.stringify(error, null, 2),
      }),
      kind: 'error',
      isLowContrast: true,
    });
  };

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => isDirty);
    }
  }, [isDirty, promptBeforeClosing]);

  const toggleSection = (section: string) => {
    setActiveSection((prev) => (prev !== section ? section : prev));
  };

  const steps = useMemo(
    () => [
      { id: 'demographic', label: t('demographicInformation', 'Demographic Info') },
      { id: 'login', label: t('loginInformation', 'Login Info') },
      { id: 'provider', label: t('providerAccount', 'Provider Account') },
      { id: 'roles', label: t('roles', 'Roles Info') },
      { id: 'additionalRoles', label: t('additionalRoles', 'Additional Roles') },
    ],
    [t],
  );

  const selectedRoles = userFormMethods.watch('roles') || [];
  const inventoryRoles = rolesConfig
    .filter((category) => category.category === 'Core Inventory Roles')
    .flatMap((category) => category.roles || []);
  const hasInventoryRole = selectedRoles.some((role) => inventoryRoles.includes(role.display));

  return (
    <div className={styles.leftContainer}>
      <div>
        <div className={styles.leftLayout}>
          <ProgressIndicator
            currentIndex={currentIndex}
            spaceEquality={true}
            vertical={true}
            className={styles.progressIndicator}
            onChange={(newIndex) => {
              toggleSection(steps[newIndex].id);
              setCurrentIndex(newIndex);
            }}>
            {steps.map((step, index) => (
              <ProgressStep key={step.id} label={step.label} className={styles.ProgresStep} />
            ))}
          </ProgressIndicator>
          <div className={styles.sections}>
            <FormProvider {...userFormMethods}>
              <form onSubmit={userFormMethods.handleSubmit(onSubmit, handleError)} className={styles.form}>
                <div className={styles.formContainer}>
                  <Stack className={styles.formStackControl} gap={7}>
                    {activeSection === 'demographic' && (
                      <ResponsiveWrapper>
                        <span className={styles.formHeaderSection}>
                          {t('healthWorkVerify', 'Health worker registry verification')}
                        </span>
                        {searchHWR.isHWRLoading ? (
                          <InlineLoading
                            className={styles.formLoading}
                            active={searchHWR.isHWRLoading}
                            description={t('pullDetailsfromHWR', 'Pulling data from Health worker registry...')}
                          />
                        ) : (
                          <>
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
                                <span className={styles.formIdentifierType}>
                                  {t('identifierNumber', 'Identifier number*')}
                                </span>
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
                            <span className={styles.formHeaderSection}>{t('demographicInfo', 'Demographic info')}</span>
                            <ResponsiveWrapper>
                              <Controller
                                name="givenName"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="givenName"
                                    type="text"
                                    labelText={t('givenName', 'Given Name')}
                                    placeholder={t('userGivenName', 'Enter Given Name')}
                                    invalid={!!errors.givenName}
                                    invalidText={errors.givenName?.message}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="middleName"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="middleName"
                                    labelText={t('middleName', 'Middle Name')}
                                    placeholder={t('middleName', 'Middle Name')}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="familyName"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="familyName"
                                    labelText={t('familyName', 'Family Name')}
                                    placeholder={t('familyName', 'Family Name')}
                                    invalid={!!errors.familyName}
                                    invalidText={errors.familyName?.message}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="phoneNumber"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="phoneNumber"
                                    type="text"
                                    disabled
                                    labelText={t('phoneNumber', 'Phone Number')}
                                    placeholder={t('phoneNumber', 'Enter Phone Number')}
                                    invalid={!!errors.phoneNumber}
                                    invalidText={errors.phoneNumber?.message}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="email"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="email"
                                    disabled
                                    type="email"
                                    labelText={t('email', 'Email')}
                                    placeholder={t('email', 'Enter Email')}
                                    invalid={!!errors.email}
                                    invalidText={errors.email?.message}
                                    className={styles.checkboxLabelSingleLine}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="gender"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <RadioButtonGroup
                                    {...field}
                                    legendText={t('gender', 'Gender')}
                                    orientation="vertical"
                                    invalid={!!errors.gender}
                                    invalidText={errors.gender?.message}>
                                    <RadioButton
                                      value="M"
                                      id="M"
                                      labelText={t('male', 'Male')}
                                      checked={field.value === 'M'}
                                    />
                                    <RadioButton
                                      value="F"
                                      id="F"
                                      labelText={t('female', 'Female')}
                                      checked={field.value === 'F'}
                                    />
                                  </RadioButtonGroup>
                                )}
                              />
                            </ResponsiveWrapper>
                          </>
                        )}
                      </ResponsiveWrapper>
                    )}
                    {activeSection === 'provider' && (
                      <ResponsiveWrapper>
                        <span className={styles.formHeaderSection}>{t('providerDetails', 'Provider details')}</span>
                        {loadingProvider || providerError ? (
                          <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
                        ) : provider.length > 0 ? (
                          <>
                            <ResponsiveWrapper>
                              <Controller
                                name="registrationNumber"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="registrationNumber"
                                    type="registrationNumber"
                                    disabled
                                    labelText={t('registrationNumber', 'Registration number')}
                                    placeholder={t('registrationNumber', 'Registration number')}
                                    invalid={!!errors.registrationNumber}
                                    invalidText={errors.registrationNumber?.message}
                                    className={styles.checkboxLabelSingleLine}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="systemId"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="systemeId"
                                    type="text"
                                    labelText={t('providerId', 'Provider Id')}
                                    placeholder={t('providerId', 'Provider Id')}
                                    invalid={!!errors.systemId}
                                    invalidText={errors.systemId?.message}
                                    className={styles.checkboxLabelSingleLine}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              {loadingLocation ? (
                                <InlineLoading
                                  status="active"
                                  iconDescription="Loading"
                                  description="Loading data..."
                                />
                              ) : (
                                <Controller
                                  name="primaryFacility"
                                  control={userFormMethods.control}
                                  render={({ field }) => (
                                    <ComboBox
                                      {...field}
                                      id="primaryFacility"
                                      items={location}
                                      itemToString={(item) => {
                                        if (!item) {
                                          return '';
                                        }
                                        const attributeValue = item.attributes?.[0]?.value || '';
                                        return `${item.name || ''} ${attributeValue}`.trim();
                                      }}
                                      titleText={t('primaryFacility', 'Primary Facility')}
                                      selectedItem={
                                        (location || []).find((item) => `${item.name || ''}`.trim() === field.value) ||
                                        null
                                      }
                                      onChange={({ selectedItem }) => {
                                        if (selectedItem) {
                                          const attributeValue = selectedItem.attributes?.[0]?.value || '';
                                          const formattedString = `${selectedItem.name || ''} ${attributeValue}`.trim();
                                          field.onChange(formattedString);
                                        } else {
                                          field.onChange('');
                                        }
                                      }}
                                    />
                                  )}
                                />
                              )}
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="isEditProvider"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <CheckboxGroup
                                    legendText={t('editProvider', 'Edit Provider Details')}
                                    className={styles.multilineCheckboxLabel}>
                                    <Checkbox
                                      className={styles.checkboxLabelSingleLine}
                                      {...field}
                                      id="isEditProvider"
                                      labelText={t('EditProviderDetails', 'Edit provider details?')}
                                      checked={field.value || false}
                                      onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                  </CheckboxGroup>
                                )}
                              />
                            </ResponsiveWrapper>
                          </>
                        ) : (
                          <>
                            <ResponsiveWrapper>
                              <Controller
                                name="nationalId"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="email"
                                    disabled
                                    type="email"
                                    labelText={t('nationalID', 'National id')}
                                    placeholder={t('nationalID', 'National id')}
                                    invalid={!!errors.nationalId}
                                    invalidText={errors.nationalId?.message}
                                    className={styles.checkboxLabelSingleLine}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="qualification"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="qualification"
                                    type="qualification"
                                    disabled
                                    labelText={t('qualification', 'Qualification')}
                                    placeholder={t('qualification', 'Qualification')}
                                    invalid={!!errors.qualification}
                                    invalidText={errors.qualification?.message}
                                    className={styles.checkboxLabelSingleLine}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="providerLicense"
                                control={userFormMethods.control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    id="providerLicense"
                                    type="text"
                                    disabled
                                    labelText={t('providerLicense', 'License Number')}
                                    placeholder={t('providerLicense', 'License Number')}
                                    className={styles.checkboxLabelSingleLine}
                                  />
                                )}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Controller
                                name="licenseExpiryDate"
                                control={userFormMethods.control}
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
                                      labelText={t('licenseExpiryDate', 'License Expiry Date')}
                                      id="formLicenseDatePicker"
                                      size="md"
                                      disabled
                                      invalid={!!errors.licenseExpiryDate}
                                      invalidText={errors.licenseExpiryDate?.message}
                                    />
                                  </DatePicker>
                                )}
                              />
                            </ResponsiveWrapper>
                            <Controller
                              name="providerIdentifiers"
                              control={userFormMethods.control}
                              render={({ field }) => (
                                <CheckboxGroup
                                  legendText={t('providerIdentifiers', 'Provider Details')}
                                  className={styles.multilineCheckboxLabel}>
                                  <Checkbox
                                    className={styles.checkboxLabelSingleLine}
                                    {...field}
                                    id="providerIdentifiers"
                                    labelText={t('providerIdentifiers', 'Create a Provider account for this user')}
                                    checked={field.value || false}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                  />
                                </CheckboxGroup>
                              )}
                            />

                            {userFormMethods.watch('providerIdentifiers') && (
                              <>
                                <ResponsiveWrapper>
                                  {loadingLocation ? (
                                    <InlineLoading
                                      status="active"
                                      iconDescription="Loading"
                                      description="Loading location data..."
                                    />
                                  ) : (
                                    <Controller
                                      name="primaryFacility"
                                      control={userFormMethods.control}
                                      render={({ field }) => (
                                        <ComboBox
                                          {...field}
                                          id="primaryFacility"
                                          items={location}
                                          itemToString={(item) => {
                                            if (!item) {
                                              return '';
                                            }
                                            const attributeValue = item.attributes?.[0]?.value || '';
                                            return `${item.name || ''} ${attributeValue}`.trim();
                                          }}
                                          titleText={t('primaryFacility', 'Primary Facility')}
                                          selectedItem={
                                            (location || []).find(
                                              (item) => `${item.name || ''}`.trim() === field.value,
                                            ) || null
                                          }
                                          onChange={({ selectedItem }) => {
                                            if (selectedItem) {
                                              const attributeValue = selectedItem.attributes?.[0]?.value || '';
                                              const formattedString = `${
                                                selectedItem.name || ''
                                              } ${attributeValue}`.trim();
                                              field.onChange(formattedString);
                                            } else {
                                              field.onChange('');
                                            }
                                          }}
                                        />
                                      )}
                                    />
                                  )}
                                </ResponsiveWrapper>
                              </>
                            )}
                          </>
                        )}
                      </ResponsiveWrapper>
                    )}
                    {activeSection === 'login' && (
                      <ResponsiveWrapper>
                        <span className={styles.formHeaderSection}>{t('loginInfo', 'Login Info')}</span>
                        <ResponsiveWrapper>
                          <Controller
                            name="username"
                            control={userFormMethods.control}
                            render={({ field }) => (
                              <TextInput
                                {...field}
                                id="username"
                                labelText={t('username', 'Username')}
                                invalid={!!errors.username}
                                invalidText={errors.username?.message}
                              />
                            )}
                          />
                        </ResponsiveWrapper>

                        <ResponsiveWrapper>
                          <Controller
                            name="password"
                            control={userFormMethods.control}
                            rules={
                              isInitialValuesEmpty
                                ? {
                                    required: 'Password is required',
                                    minLength: { value: 8, message: 'Password must be at least 8 characters long' },
                                    pattern: {
                                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                                      message: 'Password must include uppercase, lowercase, and a number',
                                    },
                                  }
                                : {}
                            }
                            render={({ field }) => (
                              <PasswordInput
                                {...field}
                                id="password"
                                labelText="Password"
                                invalid={!!errors.password}
                                invalidText={errors.password?.message}
                              />
                            )}
                          />
                        </ResponsiveWrapper>
                        <ResponsiveWrapper>
                          <Controller
                            name="confirmPassword"
                            control={userFormMethods.control}
                            rules={
                              isInitialValuesEmpty
                                ? {
                                    required: 'Please confirm your password',
                                    validate: (value) =>
                                      value === userFormMethods.watch('password') || 'Passwords do not match',
                                  }
                                : {}
                            }
                            render={({ field }) => (
                              <PasswordInput
                                {...field}
                                id="confirmPassword"
                                labelText="Confirm Password"
                                invalid={!!errors.confirmPassword}
                                invalidText={errors.confirmPassword?.message}
                              />
                            )}
                          />
                        </ResponsiveWrapper>
                        <ResponsiveWrapper>
                          <Controller
                            name="forcePasswordChange"
                            control={userFormMethods.control}
                            render={({ field }) => (
                              <CheckboxGroup
                                legendText={t('forcePasswordChange', 'Force Password Change')}
                                className={styles.checkboxGroupGrid}>
                                <Checkbox
                                  className={styles.multilineCheckboxLabel}
                                  {...field}
                                  id="forcePasswordChange"
                                  labelText={t(
                                    'forcePasswordChangeHelper',
                                    'Optionally require this user to change their password on next login',
                                  )}
                                  checked={field.value || false}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                />
                              </CheckboxGroup>
                            )}
                          />
                        </ResponsiveWrapper>
                      </ResponsiveWrapper>
                    )}

                    {activeSection === 'roles' && (
                      <ResponsiveWrapper>
                        <span className={styles.formHeaderSection}>{t('rolesInfo', 'Roles Info')}</span>
                        <ResponsiveWrapper>
                          {rolesConfig.map((category) => (
                            <Column key={category.category} xsm={8} md={12} lg={12} className={styles.checkBoxColumn}>
                              <CheckboxGroup legendText={category.category} className={styles.checkboxGroupGrid}>
                                {isLoading ? (
                                  <InlineLoading
                                    status="active"
                                    iconDescription="Loading"
                                    description="Loading data..."
                                  />
                                ) : (
                                  <Controller
                                    name="roles"
                                    control={userFormMethods.control}
                                    render={({ field }) => {
                                      const selectedRoles = field.value || [];

                                      return (
                                        <>
                                          {roles
                                            .filter((role) => category.roles.includes(role.name))
                                            .map((role) => {
                                              const isSelected = selectedRoles.some(
                                                (r) =>
                                                  r.display === role.display &&
                                                  r.description === role.description &&
                                                  r.uuid === role.uuid,
                                              );

                                              return (
                                                <label
                                                  key={role.display}
                                                  className={
                                                    isSelected ? styles.checkboxLabelSelected : styles.checkboxLabel
                                                  }>
                                                  <input
                                                    type="checkbox"
                                                    id={role.display}
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                      const updatedValue = e.target.checked
                                                        ? [
                                                            ...selectedRoles,
                                                            {
                                                              uuid: role.uuid,
                                                              display: role.display,
                                                              description: role.description ?? null,
                                                            },
                                                          ]
                                                        : selectedRoles.filter(
                                                            (selectedRole) => selectedRole.display !== role.display,
                                                          );

                                                      field.onChange(updatedValue);
                                                    }}
                                                  />
                                                  {role.display}
                                                </label>
                                              );
                                            })}
                                        </>
                                      );
                                    }}
                                  />
                                )}
                              </CheckboxGroup>
                            </Column>
                          ))}
                        </ResponsiveWrapper>
                      </ResponsiveWrapper>
                    )}

                    {/* Additional roles */}
                    {activeSection === 'additionalRoles' && (
                      <ResponsiveWrapper>
                        <CardHeader title={t('additionalRoles', 'Additional Roles')}>
                          <ChevronSortUp />
                        </CardHeader>
                        {hasInventoryRole && (
                          <>
                            <ResponsiveWrapper>
                              <Controller
                                name="stockRole"
                                control={userFormMethods.control}
                                render={({ field }) => {
                                  const selectedRoles = userFormMethods.watch('roles') || [];

                                  const inventoryRoles = rolesConfig
                                    .filter((category) => category.category === 'Core Inventory Roles')
                                    .flatMap((category) => category.roles || [])
                                    .filter((roleName) => selectedRoles.some((role) => role.display === roleName))
                                    .map((roleName) => selectedRoles.find((role) => role.display === roleName))
                                    .filter(Boolean);

                                  return (
                                    <ComboBox
                                      {...field}
                                      id="stockRole"
                                      items={inventoryRoles}
                                      itemToString={(item) => item?.display?.trim() || ''}
                                      titleText={t('userRoleScope', 'Role')}
                                      selectedItem={
                                        inventoryRoles.find((item) => item?.display === field.value) || null
                                      }
                                      onChange={({ selectedItem }) => {
                                        field.onChange(selectedItem ? selectedItem.display.trim() : '');
                                      }}
                                    />
                                  );
                                }}
                              />
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Column
                                key={t('stockOperation', 'Stock Operation')}
                                xsm={8}
                                md={12}
                                lg={12}
                                className={styles.checkBoxColumn}>
                                <CheckboxGroup
                                  legendText={t('stockOperation', 'Stock Operation')}
                                  className={styles.checkboxGroupGrid}>
                                  {loadingStock ? (
                                    <InlineLoading
                                      status="active"
                                      iconDescription="Loading"
                                      description="Loading data..."
                                    />
                                  ) : (
                                    <Controller
                                      name="stockOperation"
                                      control={userFormMethods.control}
                                      render={({ field }) => {
                                        const selectedStockOperation = field.value || [];

                                        const isSelected = (operationUuid: string) =>
                                          selectedStockOperation.some((op) => op.operationTypeUuid === operationUuid);
                                        const toggleOperation = (operation) => {
                                          if (isSelected(operation.uuid)) {
                                            field.onChange(
                                              selectedStockOperation.filter(
                                                (op) => op.operationTypeUuid !== operation.uuid,
                                              ),
                                            );
                                          } else {
                                            field.onChange([
                                              ...selectedStockOperation,
                                              {
                                                operationTypeUuid: operation.uuid,
                                                operationTypeName: operation.name,
                                              },
                                            ]);
                                          }
                                        };

                                        return (
                                          <>
                                            {stockOperations?.length > 0 &&
                                              stockOperations.map((operation) => {
                                                return (
                                                  <label
                                                    key={operation.uuid}
                                                    className={
                                                      isSelected(operation.uuid)
                                                        ? styles.checkboxLabelSelected
                                                        : styles.checkboxLabel
                                                    }>
                                                    <input
                                                      type="checkbox"
                                                      id={operation.uuid}
                                                      checked={isSelected(operation.uuid)}
                                                      onChange={() => toggleOperation(operation)}
                                                    />
                                                    {operation.name}
                                                  </label>
                                                );
                                              })}
                                          </>
                                        );
                                      }}
                                    />
                                  )}
                                </CheckboxGroup>
                              </Column>
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Column
                                key={t('location', 'Stock Location')}
                                xsm={8}
                                md={12}
                                lg={12}
                                className={styles.checkBoxColumn}>
                                <CheckboxGroup
                                  legendText={t('stockLocation', 'Stock Location')}
                                  className={styles.checkboxGroupGrid}>
                                  {loadingStock ? (
                                    <InlineLoading
                                      status="active"
                                      iconDescription="Loading"
                                      description="Loading data..."
                                    />
                                  ) : (
                                    <Controller
                                      name="operationLocation"
                                      control={userFormMethods.control}
                                      render={({ field }) => {
                                        const selectedLocations = field.value || [];

                                        const isSelected = (locationUuid: string) =>
                                          selectedLocations.some((loc) => loc.locationUuid === locationUuid);
                                        const toggleLocation = (location) => {
                                          if (isSelected(location.id)) {
                                            field.onChange(
                                              selectedLocations.filter((loc) => loc.locationUuid !== location.id),
                                            );
                                          } else {
                                            field.onChange([
                                              ...selectedLocations,
                                              { locationName: location.name, locationUuid: location.id },
                                            ]);
                                          }
                                        };

                                        return (
                                          <>
                                            {stockLocations?.length > 0 &&
                                              stockLocations.map((location) => (
                                                <label
                                                  key={location.id}
                                                  className={
                                                    isSelected(location.id)
                                                      ? styles.checkboxLabelSelected
                                                      : styles.checkboxLabel
                                                  }>
                                                  <input
                                                    type="checkbox"
                                                    id={location.id}
                                                    checked={isSelected(location.id)}
                                                    onChange={() => toggleLocation(location)}
                                                  />
                                                  {location.name}
                                                </label>
                                              ))}
                                          </>
                                        );
                                      }}
                                    />
                                  )}
                                </CheckboxGroup>
                              </Column>
                            </ResponsiveWrapper>
                            <ResponsiveWrapper>
                              <Column xsm={8} md={12} lg={12} className={styles.checkBoxColumn}>
                                <CheckboxGroup
                                  legendText={t('inventoryUser', 'Inventory User')}
                                  className={styles.checkboxGroupGrid}>
                                  <Controller
                                    name="enabled"
                                    control={userFormMethods.control}
                                    render={({ field }) => (
                                      <div>
                                        <label htmlFor="enable">
                                          <input
                                            type="checkbox"
                                            id="enable"
                                            name="enabled"
                                            checked={field.value || false}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                          />
                                          {t('enable', 'Enable?')}
                                        </label>
                                      </div>
                                    )}
                                  />
                                  {userFormMethods?.watch('enabled') && (
                                    <Controller
                                      name="permanent"
                                      control={userFormMethods.control}
                                      render={({ field }) => (
                                        <div>
                                          <label htmlFor="permanent">
                                            <input
                                              type="checkbox"
                                              id="permanent"
                                              name="permanent"
                                              checked={field.value || false}
                                              onChange={(e) => {
                                                field.onChange(e.target.checked);
                                                if (e.target.checked) {
                                                  userFormMethods.setValue('dateRange', {
                                                    activeFrom: undefined,
                                                    activeTo: undefined,
                                                  });
                                                }
                                              }}
                                            />
                                            {t('permanent', 'Permanent?')}
                                          </label>
                                        </div>
                                      )}
                                    />
                                  )}
                                </CheckboxGroup>
                                {!userFormMethods?.watch('permanent') && userFormMethods?.watch('enabled') && (
                                  <ResponsiveWrapper>
                                    <Tile>
                                      <Controller
                                        name="dateRange"
                                        control={userFormMethods.control}
                                        render={({ field }) => {
                                          const { value, onChange } = field;

                                          const handleDateChange = (dates: Array<Date>) => {
                                            onChange({
                                              activeFrom: dates[0],
                                              activeTo: dates[1],
                                            });
                                          };

                                          return (
                                            <DatePicker
                                              datePickerType="range"
                                              light
                                              minDate={formatDatetime(MinDate)}
                                              locale="en"
                                              dateFormat={DATE_PICKER_CONTROL_FORMAT}
                                              onChange={handleDateChange}
                                              value={[value?.activeFrom, value?.activeTo]}>
                                              <DatePickerInput
                                                id="date-picker-input-id-start"
                                                name="activeFrom"
                                                placeholder={DATE_PICKER_FORMAT}
                                                labelText={t('activeFrom', 'Active From')}
                                                value={value?.activeFrom}
                                              />
                                              <DatePickerInput
                                                id="date-picker-input-id-finish"
                                                name="activeTo"
                                                placeholder={DATE_PICKER_FORMAT}
                                                labelText={t('activeTo', 'Active To')}
                                                value={value?.activeTo}
                                              />
                                            </DatePicker>
                                          );
                                        }}
                                      />
                                    </Tile>
                                  </ResponsiveWrapper>
                                )}
                              </Column>
                            </ResponsiveWrapper>
                          </>
                        )}
                      </ResponsiveWrapper>
                    )}
                  </Stack>
                </div>
                <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
                  {activeSection === 'demographic' || activeSection === 'additionalRoles' ? (
                    <Button kind="secondary" onClick={closeWorkspace} className={styles.btn}>
                      {t('cancel', 'Cancel')}
                    </Button>
                  ) : (
                    <Button
                      kind="secondary"
                      onClick={() => {
                        toggleSection(steps[currentIndex - 1].id);
                        setCurrentIndex(currentIndex - 1);
                      }}
                      className={styles.btn}>
                      {t('back', 'Back')}
                    </Button>
                  )}
                  {activeSection === 'additionalRoles' || !hasInventoryRole ? (
                    <Button
                      kind="primary"
                      type="submit"
                      disabled={isSubmitting || Object.keys(errors).length > 0}
                      className={styles.btn}>
                      {isSubmitting ? (
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {t('submitting', 'Submitting...')} <InlineLoading status="active" />
                        </span>
                      ) : (
                        t('saveAndClose', 'Save & close')
                      )}
                    </Button>
                  ) : (
                    <Button
                      kind="primary"
                      renderIcon={ChevronRight}
                      className={styles.btn}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSection(steps[currentIndex + 1].id);

                        setCurrentIndex(currentIndex + 1);
                      }}>
                      {t('next', 'Next')}
                    </Button>
                  )}
                </ButtonSet>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUserWorkspace;
