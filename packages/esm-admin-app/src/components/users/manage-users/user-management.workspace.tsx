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
  createProvider,
} from '../../../user-management.resources';
import UserManagementFormSchema from '../userManagementFormSchema';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib/src';
import { ChevronSortUp, Query, ChevronRight } from '@carbon/react/icons';
import { useSystemUserRoleConfigSetting } from '../../hook/useSystemRoleSetting';
import { type PractitionerResponse, Provider, User } from '../../../types';
import { searchHealthCareWork } from '../../hook/searchHealthCareWork';
import { ROLE_CATEGORIES, today } from '../../../constants';
import { ConfigObject } from '../../../config-schema';
import { mutate } from 'swr';
import { createProviderAttribute, updateProviderAttributes } from '../../modal/hwr-sync.resource';

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

  const { userManagementFormSchema } = UserManagementFormSchema();

  const { providerAttributeType = [] } = useProviderAttributeType();

  const { roles = [], isLoading } = useRoles();
  const { rolesConfig, error } = useSystemUserRoleConfigSetting();
  const {
    identifierTypes,
    licenseBodyUuid,
    passportNumberUuid,
    personEmailAttributeUuid,
    personPhonenumberAttributeUuid,
    phoneNumberUuid,
    providerAddressUuid,
    providerHieFhirReference,
    qualificationUuid,
    providerNationalIdUuid,
    licenseNumberUuid,
    licenseExpiryDateUuid,
  } = useConfig<ConfigObject>();
  const [searchHWR, setSearchHWR] = useState({
    identifierType: identifierTypes[0]?.key ?? '',
    identifier: '',
    isHWRLoading: false,
  });
  const defaultIdentifierType = identifierTypes.find((item) => item.key === searchHWR.identifierType);

  const attributeTypeMapping = useMemo(() => {
    return {
      licenseNumber: providerAttributeType.find((type) => type.uuid === licenseNumberUuid)?.uuid || '',
      licenseExpiry: providerAttributeType.find((type) => type.uuid === licenseExpiryDateUuid)?.uuid || '',
      providerNationalId: providerAttributeType.find((type) => type.uuid === providerNationalIdUuid)?.uuid || '',
      providerHieFhirReference:
        providerAttributeType.find((type) => type.uuid === providerHieFhirReference)?.uuid || '',
      qualification: providerAttributeType.find((type) => type.uuid === qualificationUuid)?.uuid || '',
      licenseBody: providerAttributeType.find((type) => type.uuid === licenseBodyUuid)?.uuid || '',
      phoneNumber: providerAttributeType.find((type) => type.uuid === phoneNumberUuid)?.uuid || '',
      providerAddress: providerAttributeType.find((type) => type.uuid === providerAddressUuid)?.uuid || '',
      passportNumber: providerAttributeType.find((type) => type.uuid === passportNumberUuid)?.uuid || '',
    };
  }, [
    licenseBodyUuid,
    licenseExpiryDateUuid,
    licenseNumberUuid,
    passportNumberUuid,
    phoneNumberUuid,
    providerAddressUuid,
    providerAttributeType,
    providerHieFhirReference,
    providerNationalIdUuid,
    qualificationUuid,
  ]);

  const providerAttributes = useMemo(() => provider.flatMap((item) => item.attributes || []), [provider]);

  const getProviderAttributeValue = useCallback(
    (uuid: string, key = 'value') => providerAttributes.find((attr) => attr.attributeType?.uuid === uuid)?.[key],
    [providerAttributes],
  );

  const providerLicenseNumber = useMemo(
    () => getProviderAttributeValue(attributeTypeMapping.licenseNumber),
    [attributeTypeMapping, getProviderAttributeValue],
  );

  const licenseExpiryDate = useMemo(() => {
    const value = getProviderAttributeValue(attributeTypeMapping.licenseExpiry);
    return value ? new Date(value) : '';
  }, [attributeTypeMapping, getProviderAttributeValue]);

  const qualification = useMemo(
    () => getProviderAttributeValue(attributeTypeMapping.qualification),
    [attributeTypeMapping, getProviderAttributeValue],
  );
  const nationalId = useMemo(
    () => getProviderAttributeValue(attributeTypeMapping.providerNationalId),
    [attributeTypeMapping, getProviderAttributeValue],
  );
  const passportNumber = useMemo(
    () => getProviderAttributeValue(attributeTypeMapping.passportNumber),
    [attributeTypeMapping, getProviderAttributeValue],
  );
  const registrationNumber = useMemo(
    () => getProviderAttributeValue(attributeTypeMapping.licenseBody),
    [attributeTypeMapping, getProviderAttributeValue],
  );
  const phoneNumber = useMemo(
    () => getProviderAttributeValue(attributeTypeMapping.phoneNumber),
    [attributeTypeMapping, getProviderAttributeValue],
  );
  const email = useMemo(
    () => getProviderAttributeValue(attributeTypeMapping.providerAddress),
    [attributeTypeMapping, getProviderAttributeValue],
  );
  const isInitialValuesEmpty = Object.keys(initialUserValue).length === 0;
  type UserFormSchema = z.infer<typeof userManagementFormSchema>;
  const formDefaultValues = useMemo(() => {
    if (isInitialValuesEmpty) {
      return {};
    }
    const extractNameParts = (display = '') => {
      const nameParts = display.split(' ');

      const [givenName = '', middleName = '', familyName = ''] =
        nameParts.length === 3 ? nameParts : [nameParts[0], '', nameParts[1] || ''];

      return { givenName, middleName, familyName };
    };

    return {
      ...initialUserValue,
      ...extractNameParts(initialUserValue.person?.display || ''),
      phoneNumber: phoneNumber,
      email: email,
      roles:
        initialUserValue.roles?.map((role) => ({
          uuid: role.uuid,
          display: role.display,
          description: role.description,
        })) || [],
      gender: initialUserValue.person?.gender,
      providerLicense: providerLicenseNumber,
      licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : undefined,
      qualification: qualification,
      nationalId: nationalId,
      passportNumber: passportNumber,
      registrationNumber: registrationNumber,
    };
  }, [
    isInitialValuesEmpty,
    initialUserValue,
    phoneNumber,
    email,
    providerLicenseNumber,
    licenseExpiryDate,
    qualification,
    nationalId,
    passportNumber,
    registrationNumber,
  ]);

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
    if (!loadingProvider && !isInitialValuesEmpty) {
      reset(formDefaultValues);
    }
  }, [loadingProvider, formDefaultValues, isInitialValuesEmpty, reset]);

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
          const healthWorkerPassPortNumber = fetchedHealthWorker?.link
            ?.find(
              (link: { relation: string; url: string }) =>
                link.relation === 'self' && link.url.includes('identifierType=Passport'),
            )
            ?.url.split('identifierNumber=')[1]
            ?.split('&')[0];

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
          setValue('passportNumber', healthWorkerPassPortNumber);
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
    const setProvider = data.providerIdentifiers;
    const editProvider = data.isEditProvider;
    const providerUUID = provider[0]?.uuid || '';

    const providerPayload: Partial<Provider> = {
      attributes: [
        { attributeType: attributeTypeMapping.licenseNumber, value: data.providerLicense },
        {
          attributeType: attributeTypeMapping.licenseExpiry,
          value: data.licenseExpiryDate ? data.licenseExpiryDate.toISOString() : '',
        },
        { attributeType: attributeTypeMapping.licenseBody, value: data.registrationNumber },
        {
          attributeType: attributeTypeMapping?.providerHieFhirReference,
          value: JSON.stringify(healthWorker),
        },
        {
          attributeType: attributeTypeMapping.providerNationalId,
          value: data.nationalId,
        },
        {
          attributeType: attributeTypeMapping.qualification,
          value: data.qualification,
        },
        {
          attributeType: attributeTypeMapping.passportNumber,
          value: data.passportNumber,
        },
        {
          attributeType: attributeTypeMapping.phoneNumber,
          value: data.phoneNumber,
        },
        {
          attributeType: attributeTypeMapping.providerAddress,
          value: data.email,
        },
      ].filter((attr) => attr.value),
    };

    const payload: Partial<User> = {
      username: data.username,
      password: data.password,
      person: {
        uuid: initialUserValue?.person?.uuid,
        names: [{ givenName: data.givenName, familyName: data.familyName, middleName: data.middleName }],
        gender: data.gender,
        attributes: [
          { attributeType: personPhonenumberAttributeUuid, value: data.phoneNumber },
          { attributeType: personEmailAttributeUuid, value: data.email },
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

        handleMutation(
          `${restBaseUrl}/user?v=custom:(uuid,username,display,systemId,retired,person:(uuid,display,gender,names:(givenName,familyName,middleName),attributes:(uuid,display)),roles:(uuid,description,display,name))`,
        );

        if (setProvider) {
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
        if (editProvider) {
          const updatableAttributes = [
            {
              attributeType: licenseBodyUuid,
              value: data?.registrationNumber,
            },
            {
              attributeType: providerNationalIdUuid,
              value: data?.nationalId,
            },
            {
              attributeType: licenseNumberUuid,
              value: data?.providerLicense,
            },
            {
              attributeType: passportNumberUuid,
              value: data?.passportNumber,
            },
          ].filter((attr) => attr?.value !== undefined && attr?.value !== null && attr?.value !== '');

          await Promise.all(
            updatableAttributes?.map((attr) => {
              const existingAttributes = provider[0]?.attributes?.find(
                (at) => at?.attributeType?.uuid === attr?.attributeType,
              )?.uuid;

              const payload = {
                attributeType: attr?.attributeType,
                value: attr?.value,
              };

              if (!existingAttributes) {
                return createProviderAttribute(payload, providerUUID);
              }
              return updateProviderAttributes(payload, providerUUID, existingAttributes);
            }),
          );
          showSnackbar({
            title: 'Success',
            kind: 'success',
            subtitle: t('updateMessage', 'Provider updated successfully'),
          });
        }
      } else {
        throw new Error('User creation failed');
      }
      handleMutation(`${restBaseUrl}/user`);
      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/provider`));
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
    ],
    [t],
  );

  function filterRolesConfig(rolesConfig) {
    return rolesConfig.filter((category) => category.category !== ROLE_CATEGORIES.CORE_INVENTORY);
  }

  const hasLoginInfo = activeSection === 'login';
  const hasRoles = activeSection === 'roles';
  const hasDemographicInfo = activeSection === 'demographic';
  const hasProviderAccount = activeSection === 'provider';

  const isSaveAndClose = () => !(hasDemographicInfo || hasLoginInfo || hasProviderAccount);

  const getSubmitButtonText = () =>
    t(isSaveAndClose() ? 'saveAndClose' : 'next', isSaveAndClose() ? 'Save & close' : 'Next');

  const getSubmitButtonType = () => (isSaveAndClose() ? 'submit' : '');

  const getSubmitButtonIcon = () => (isSaveAndClose() ? '' : ChevronRight);

  const handleBackClick = () => {
    if (hasDemographicInfo) {
      closeWorkspace();
    } else {
      toggleSection(steps[currentIndex - 1].id);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextClick = (e) => {
    if (!isSaveAndClose()) {
      e.preventDefault();
      toggleSection(steps[currentIndex + 1].id);
      setCurrentIndex(currentIndex + 1);
    }
  };

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
              if (!searchHWR.isHWRLoading) {
                toggleSection(steps[newIndex].id);
                setCurrentIndex(newIndex);
              }
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
                    {hasDemographicInfo && (
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
                                    disabled={isInitialValuesEmpty}
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
                                    type="email"
                                    disabled={isInitialValuesEmpty}
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
                                    legendText={t('sex', 'Sex')}
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
                    {hasProviderAccount && (
                      <ResponsiveWrapper>
                        <span className={styles.formHeaderSection}>{t('providerDetails', 'Provider details')}</span>
                        <ResponsiveWrapper>
                          <Controller
                            name="nationalId"
                            control={userFormMethods.control}
                            render={({ field }) => (
                              <TextInput
                                {...field}
                                id="nationalId"
                                disabled={isInitialValuesEmpty}
                                type="text"
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
                            name="passportNumber"
                            control={userFormMethods.control}
                            render={({ field }) => (
                              <TextInput
                                {...field}
                                id="passportNumber"
                                disabled={isInitialValuesEmpty}
                                type="text"
                                labelText={t('passportNumber', 'Passport number')}
                                placeholder={t('passportNumber', 'Passport number')}
                                invalid={!!errors.nationalId}
                                invalidText={errors.nationalId?.message}
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
                                disabled={isInitialValuesEmpty}
                                labelText={t('providerLicense', 'License Number')}
                                placeholder={t('providerLicense', 'License Number')}
                                className={styles.checkboxLabelSingleLine}
                              />
                            )}
                          />
                        </ResponsiveWrapper>
                        <ResponsiveWrapper>
                          <Controller
                            name="registrationNumber"
                            control={userFormMethods.control}
                            render={({ field }) => (
                              <TextInput
                                {...field}
                                id="registrationNumber"
                                type="text"
                                disabled={isInitialValuesEmpty}
                                labelText={t('registrationNumber', 'Registration Number')}
                                placeholder={t('registrationNumber', 'Registration Number')}
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
                                value={field.value ? new Date(field.value) : ''}>
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
                        {loadingProvider || providerError ? (
                          <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
                        ) : provider.length > 0 ? (
                          <>
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
                                    id="providerIdentifiersa"
                                    labelText={t('providerIdentifiers', 'Create a Provider account for this user')}
                                    checked={field.value || false}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                  />
                                </CheckboxGroup>
                              )}
                            />
                          </>
                        )}
                      </ResponsiveWrapper>
                    )}
                    {hasLoginInfo && (
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

                    {hasRoles && (
                      <ResponsiveWrapper>
                        <span className={styles.formHeaderSection}>{t('rolesInfo', 'Roles Info')}</span>
                        <ResponsiveWrapper>
                          {filterRolesConfig(rolesConfig).map((category) => (
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
                  </Stack>
                </div>
                <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
                  <Button kind="secondary" onClick={handleBackClick} className={styles.btn}>
                    {t(hasDemographicInfo ? 'cancel' : 'back', hasDemographicInfo ? 'Cancel' : 'Back')}
                  </Button>

                  <Button
                    kind="primary"
                    type={getSubmitButtonType()}
                    disabled={isSubmitting || Object.keys(errors).length > 0 || searchHWR.isHWRLoading}
                    renderIcon={getSubmitButtonIcon()}
                    className={styles.btn}
                    onClick={handleNextClick}>
                    {isSubmitting ? (
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {t('submitting', 'Submitting...')} <InlineLoading status="active" />
                      </span>
                    ) : (
                      getSubmitButtonText()
                    )}
                  </Button>
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
