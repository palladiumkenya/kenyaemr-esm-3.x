import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import styles from './manage-user.workspace.scss';
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
  Grid,
  Tabs,
  Tab,
  ClickableTile,
} from '@carbon/react';
import { z } from 'zod';
import { User, UserSchema } from '../../../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUser, handleMutation, useRoles, useUser } from '../../../user-management.resources';
import useManageUserFormSchema from '../ManageUserFormSchema';
import { CardHeader } from '@openmrs/esm-patient-common-lib/src';
import { ChevronSortUp } from '@carbon/react/icons';
import { useSystemUserRoleConfigSetting } from '../../hook/useSystemRoleSetting';

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

  const { manageUserFormSchema } = useManageUserFormSchema();

  type UserFormSchema = z.infer<typeof manageUserFormSchema>;
  const formDefaultValues = Object.keys(initialUserValue).length > 0 ? initialUserValue : {};

  const formMethods = useForm<UserFormSchema>({
    resolver: zodResolver(manageUserFormSchema),
    mode: 'all',
    defaultValues: formDefaultValues,
  });

  const { errors, isSubmitting, isDirty } = formMethods.formState;

  const { roles = [], isLoading } = useRoles();
  const { rolesConfig, error } = useSystemUserRoleConfigSetting();

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => isDirty);
    }
  }, [isDirty, promptBeforeClosing]);

  const onSubmit = async (data: UserFormSchema) => {
    const emaiAttribute = 'b8d0b331-1d2d-4a9a-b741-1816f498bdb6';
    const telephoneAttribute = 'b2c38640-2603-4629-aebd-3b54f33f1e3a';
    // Combine all roles into a single array
    const allRoles = [
      ...(data.adminRoles || []).map((role) => (typeof role === 'string' ? { name: role } : role)),
      ...(data.billingRoles || []).map((role) => (typeof role === 'string' ? { name: role } : role)),
      ...(data.clinicalRoles || []).map((role) => (typeof role === 'string' ? { name: role } : role)),
      ...(data.recordRoles || []).map((role) => (typeof role === 'string' ? { name: role } : role)),
      ...(data.pharmacistRoles || []).map((role) => (typeof role === 'string' ? { name: role } : role)),
      ...(data.inventoryRoles || []).map((role) => (typeof role === 'string' ? { name: role } : role)),
      ...(data.investigationRoles || []).map((role) => (typeof role === 'string' ? { name: role } : role)),
      ...(data.recordRoles || []).map((role) => (typeof role === 'string' ? { name: role } : role)),
    ];
    const payload: Partial<UserSchema> = {
      username: data.username,
      password: data.password,
      systemId: data.systemId,
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
            attributeType: emaiAttribute,
            value: data.phoneNumber,
          },
          {
            attributeType: telephoneAttribute,
            value: data.email,
          },
        ],
      },
      roles: allRoles
        .filter((role): role is { name: string; description?: string } => typeof role === 'object' && 'name' in role)
        .map((role) => ({
          name: role.name,
          description: role.description ?? null,
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

        closeWorkspaceWithSavedChanges();
        handleMutation(`${restBaseUrl}/user?includeAll=true&v=default`);
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

  // const handleTabClick = (selectedSection) => {
  //   toggleSection(selectedSection);
  // };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit, handleError)} className={styles.form}>
        <div className={styles.formContainer}>
          <Grid className={styles.grid}>
            <Column xsm={0} md={4} lg={4} className={styles.columnGridLeft} condensed>
              <ul className={styles.list}>
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
              </ul>
            </Column>
            <Column xsm={12} md={12} lg={12} className={styles.columnGridRight}>
              <Stack className={styles.formStackControl} gap={7}>
                {activeSection == 'demographic' && (
                  <ResponsiveWrapper>
                    <CardHeader title="Dempgraphic Info">
                      <ChevronSortUp />
                    </CardHeader>
                    <Controller
                      name="givenName"
                      control={formMethods.control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          id="givenName"
                          type="text"
                          labelText={t('givenName', 'Given Name')}
                          placeholder={t('userGivenName', 'Enter Given name')}
                          invalid={!!errors.givenName}
                          invalidText={errors.givenName?.message}
                        />
                      )}
                    />
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
                    <Controller
                      name="phoneNumber"
                      control={formMethods.control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          id="phoneNumber"
                          type="text"
                          labelText={t('phoneNumber', 'Phone Number')}
                          placeholder={t('phoneNumber', 'Phone Number')}
                          invalid={!!errors.givenName}
                          invalidText={errors.givenName?.message}
                        />
                      )}
                    />

                    <Controller
                      name="email"
                      control={formMethods.control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          id="email"
                          type="email"
                          labelText={t('email', 'Email')}
                          placeholder={t('phoneNumber', 'Email')}
                          invalid={!!errors.givenName}
                          className={styles.checkboxLabelSingleLine}
                          invalidText={errors.givenName?.message}
                        />
                      )}
                    />

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
                          <RadioButton value="Male" labelText={t('male', 'Male')} />
                          <RadioButton value="Female" labelText={t('female', 'Female')} />
                        </RadioButtonGroup>
                      )}
                    />
                  </ResponsiveWrapper>
                )}
                <ResponsiveWrapper>
                  {activeSection === 'provider' && (
                    <ResponsiveWrapper>
                      <CardHeader title="Provider Details">
                        <ChevronSortUp />
                      </CardHeader>
                      <Controller
                        name="providerIdentifiers"
                        control={formMethods.control}
                        render={({ field }) => (
                          <CheckboxGroup
                            legendText={t('providerIdentifiers', 'Provider Details')}
                            className={styles.checkboxGroupGrid}>
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
                  )}
                </ResponsiveWrapper>
                <ResponsiveWrapper>
                  {activeSection === 'login' && (
                    <ResponsiveWrapper>
                      <CardHeader title="Login Info">
                        <ChevronSortUp />
                      </CardHeader>
                      <Controller
                        name="systemId"
                        control={formMethods.control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            id="systemId"
                            labelText={t('systemId', 'System ID')}
                            invalid={!!errors.systemId}
                            invalidText={errors.systemId?.message}
                          />
                        )}
                      />
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
                      <Controller
                        name="password"
                        control={formMethods.control}
                        render={({ field }) => (
                          <PasswordInput
                            {...field}
                            id="password"
                            type="password"
                            labelText={t('password', 'Password')}
                            helperText={t(
                              'passwordHelper',
                              'Password must be 8 characters long, include upper and lower characters, at least one digit, one non digit',
                            )}
                            invalid={!!errors.password}
                            invalidText={errors.password?.message}
                          />
                        )}
                      />
                      <Controller
                        name="confirmPassword"
                        control={formMethods.control}
                        render={({ field }) => (
                          <PasswordInput
                            {...field}
                            id="confirmPassword"
                            type="password"
                            labelText={t('confirmPassword', 'Confirm Password')}
                            helperText={t('confirmPasswordHelper', 'Retype the password (for accuracy)')}
                            invalid={!!errors.confirmPassword}
                            invalidText={errors.confirmPassword?.message}
                          />
                        )}
                      />
                      <Controller
                        name="forcePasswordChange"
                        control={formMethods.control}
                        render={({ field }) => (
                          <CheckboxGroup
                            legendText={t('forcePasswordChange', 'Force Password Change')}
                            className={styles.checkboxGroupGrid}>
                            <Checkbox
                              className={styles.checkboxLabelSingleLine}
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
                  )}
                </ResponsiveWrapper>

                <ResponsiveWrapper>
                  {activeSection === 'roles' && (
                    <ResponsiveWrapper>
                      <CardHeader title="Roles Info">
                        <ChevronSortUp />
                      </CardHeader>
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
                      <ResponsiveWrapper>
                        <Grid>
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
                                    name="adminRoles"
                                    control={formMethods.control}
                                    render={({ field }) => (
                                      <>
                                        {roles
                                          .filter((role) => category.roles.includes(role.name))
                                          .map((role) => {
                                            const isSelected = field.value?.includes(role.display);
                                            return (
                                              <label
                                                key={role.uuid}
                                                className={
                                                  isSelected ? styles.checkboxLabelSelected : styles.checkboxLabel
                                                }>
                                                <input
                                                  type="checkbox"
                                                  id={role.name}
                                                  checked={isSelected}
                                                  onChange={(e) => {
                                                    const value = e.target.checked
                                                      ? [...(field.value || []), role.display]
                                                      : (field.value || []).filter(
                                                          (selectedRole) => selectedRole !== role.display,
                                                        );
                                                    field.onChange(value);
                                                  }}
                                                />
                                                {role.display}
                                              </label>
                                            );
                                          })}
                                      </>
                                    )}
                                  />
                                )}
                              </CheckboxGroup>
                            </Column>
                          ))}
                        </Grid>
                      </ResponsiveWrapper>
                    </ResponsiveWrapper>
                  )}
                </ResponsiveWrapper>
              </Stack>
            </Column>
          </Grid>
        </div>
        <ButtonSet>
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
  );
};

export default ManageUserWorkspace;
