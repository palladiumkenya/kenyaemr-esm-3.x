import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
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
  SelectItem,
  Select,
  PasswordInput,
  Column,
  ClickableTile,
  Tile,
} from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { createUser, handleMutation, useRoles, usePersonAttribute } from '../../../user-management.resources';
import UserManagementFormSchema from '../userManagementFormSchema';
import { CardHeader } from '@openmrs/esm-patient-common-lib/src';
import { ChevronSortUp } from '@carbon/react/icons';
import { useSystemUserRoleConfigSetting } from '../../hook/useSystemRoleSetting';
import { User } from '../../../config-schema';

type ManageUserWorkspaceProps = DefaultWorkspaceProps & {
  initialUserValue?: User;
};

const ManageUserWorkspace: React.FC<ManageUserWorkspaceProps> = ({
  closeWorkspace,
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
  initialUserValue = {} as User,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [activeSection, setActiveSection] = useState('demographic');

  const { userManagementFormSchema } = UserManagementFormSchema();

  const isInitialValuesEmpty = Object.keys(initialUserValue).length === 0;
  type UserFormSchema = z.infer<typeof userManagementFormSchema>;
  const formDefaultValues =
    Object.keys(initialUserValue).length > 0
      ? {
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
          gender: initialUserValue.person?.gender || 'M',
        }
      : {};

  function extractNameParts(display = '') {
    const nameParts = display.split(' ');

    const [givenName = '', middleName = '', familyName = ''] =
      nameParts.length === 3 ? nameParts : [nameParts[0], '', nameParts[1] || ''];

    return { givenName, middleName, familyName };
  }

  function extractAttributeValue(attributes, prefix) {
    return attributes?.find((attr) => attr.display.startsWith(prefix))?.display?.split(' ')[3] || '';
  }

  const formMethods = useForm<UserFormSchema>({
    resolver: zodResolver(userManagementFormSchema),
    mode: 'all',
    defaultValues: formDefaultValues,
  });

  const { errors, isSubmitting, isDirty } = formMethods.formState;

  const { roles = [], isLoading } = useRoles();
  const { rolesConfig, error } = useSystemUserRoleConfigSetting();
  const { attributeTypes = [] } = usePersonAttribute();

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => isDirty);
    }
  }, [isDirty, promptBeforeClosing]);

  const onSubmit = async (data: UserFormSchema) => {
    const emailAttribute = attributeTypes.find((attr) => attr.name === 'Email address')?.uuid || '';
    const telephoneAttribute = attributeTypes.find((attr) => attr.name === 'Telephone contact')?.uuid || '';
    const payload: Partial<User> = {
      username: data.username,
      password: data.password,
      person: {
        names: [
          {
            givenName: data.givenName,
            familyName: data.familyName,
            middleName: data.middleName,
          },
        ],
        gender: data.gender,
        attributes: [
          {
            attributeType: telephoneAttribute,
            value: data.phoneNumber,
          },
          {
            attributeType: emailAttribute,
            value: data.email,
          },
        ],
      },
      roles: data.roles.map((role) => ({
        uuid: role.uuid,
        name: role.display,
        description: role.description || '',
      })),
    };

    try {
      const response = await createUser(payload, initialUserValue?.uuid ?? '');

      if (response.ok) {
        showSnackbar({
          title: t('userSaved', 'User saved successfully'),
          kind: 'success',
          isLowContrast: true,
        });

        handleMutation(`${restBaseUrl}/user?v=full`);
        closeWorkspaceWithSavedChanges();
      }
    } catch (error) {
      const errorObject = error?.responseBody?.error;
      const errorMessage = errorObject?.message ?? 'An error occurred while creating user';

      showSnackbar({
        title: t('userSaveFailed', 'Failed to save user'),
        subtitle: t('userCreationFailedSubtitle', 'An error occurred while creating user {{errorMessage}}', {
          errorMessage,
        }),
        kind: 'error',
        isLowContrast: true,
      });
    }
  };

  const handleError = (error) => {
    showSnackbar({
      title: t('userSaveFailed', 'Failed to save user'),
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

  const toggleSection = (section) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className={styles.leftTabsContainer}>
      <div>
        <div className={styles.leftTabsLayout}>
          <Tile className={styles.tabList}>
            <ClickableTile
              className={`${styles.listItem} ${activeSection === 'demographic' ? styles.active : ''}`}
              onClick={() => toggleSection('demographic')}>
              {t('demographicInformation', 'Demographic Info')}
            </ClickableTile>
            <ClickableTile
              className={`${styles.listItem} ${activeSection === 'provider' ? styles.active : ''}`}
              onClick={() => toggleSection('provider')}>
              {t('providerAccount', 'Provider Account')}
            </ClickableTile>
            <ClickableTile
              className={`${styles.listItem} ${activeSection === 'login' ? styles.active : ''}`}
              onClick={() => toggleSection('login')}>
              {t('loginInformation', 'Login Info')}
            </ClickableTile>
            <ClickableTile
              className={`${styles.listItem} ${activeSection === 'roles' ? styles.active : ''}`}
              onClick={() => toggleSection('roles')}>
              {t('roles', 'Roles Info')}
            </ClickableTile>
          </Tile>
          <div className={styles.tabPanels}>
            <FormProvider {...formMethods}>
              <form onSubmit={formMethods.handleSubmit(onSubmit, handleError)} className={styles.form}>
                <div className={styles.formContainer}>
                  <Stack className={styles.formStackControl} gap={7}>
                    {activeSection === 'demographic' && (
                      <ResponsiveWrapper>
                        <CardHeader title="Demographic Info">
                          <ChevronSortUp />
                        </CardHeader>

                        <ResponsiveWrapper>
                          <Controller
                            name="givenName"
                            control={formMethods.control}
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
                            control={formMethods.control}
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
                            control={formMethods.control}
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
                            control={formMethods.control}
                            render={({ field }) => (
                              <TextInput
                                {...field}
                                id="phoneNumber"
                                type="text"
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
                            control={formMethods.control}
                            render={({ field }) => (
                              <TextInput
                                {...field}
                                id="email"
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
                            control={formMethods.control}
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
                      </ResponsiveWrapper>
                    )}

                    {activeSection === 'provider' && (
                      <ResponsiveWrapper>
                        <CardHeader title="Provider Details">
                          <ChevronSortUp />
                        </CardHeader>
                        <ResponsiveWrapper>
                          <Controller
                            name="providerIdentifiers"
                            control={formMethods.control}
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
                        </ResponsiveWrapper>
                      </ResponsiveWrapper>
                    )}

                    {activeSection === 'login' && (
                      <ResponsiveWrapper>
                        <CardHeader title="Login Info">
                          <ChevronSortUp />
                        </CardHeader>
                        <ResponsiveWrapper>
                          <Controller
                            name="username"
                            control={formMethods.control}
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
                            control={formMethods.control}
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
                            control={formMethods.control}
                            rules={
                              isInitialValuesEmpty
                                ? {
                                    required: 'Please confirm your password',
                                    validate: (value) =>
                                      value === formMethods.watch('password') || 'Passwords do not match',
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
                            control={formMethods.control}
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
                        <CardHeader title="Roles Info">
                          <ChevronSortUp />
                        </CardHeader>
                        <ResponsiveWrapper>
                          <Controller
                            name="primaryRole"
                            control={formMethods.control}
                            render={({ field }) => (
                              <Select id="carder-select" labelText={t('primaryRole', 'Primary Role')} {...field}>
                                <SelectItem value="" text={t('selectOption', 'Choose an option')} />
                                <SelectItem value="admin" text={t('admin', 'Admin')} />
                                <SelectItem value="provider" text={t('provider', 'Provider')} />
                                <SelectItem value="nurse" text={t('nurse', 'Nurse')} />
                              </Select>
                            )}
                          />
                        </ResponsiveWrapper>

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
                                    control={formMethods.control}
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
                  <Button kind="secondary" onClick={closeWorkspace} className={styles.btn}>
                    {t('cancel', 'Cancel')}
                  </Button>
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
