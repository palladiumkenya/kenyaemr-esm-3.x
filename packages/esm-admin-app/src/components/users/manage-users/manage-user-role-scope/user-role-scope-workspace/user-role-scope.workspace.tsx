import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import styles from '../../../manage-users/user-management.workspace.scss';
import { TextInput, ButtonSet, Button, InlineLoading, Stack } from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { User, UserRoleScope } from '../../../../../types';
import UserRoleScopeFormSchema from './userRoleScopeFormSchema';
import {
  createOrUpdateUserRoleScope,
  handleMutation,
  useStockOperationTypes,
  useStockTagLocations,
  useUserRoleScopes,
} from '../../../../../user-management.resources';
import { formatNewDate, ROLE_CATEGORIES, today } from '../../../../../constants';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib/src';
import { Add, ChevronSortUp } from '@carbon/react/icons';
import { useSystemUserRoleConfigSetting } from '../../../../hook/useSystemRoleSetting';
import UserRoleScopeFormFields from './user-role-scope-fields.component';
import StockUserRoleScopesList from '../user-role-scope-list/user-role-scope-list.component';

type UserRoleScopeWorkspaceProps = DefaultWorkspaceProps & {
  user?: User;
};

const UserRoleScopeWorkspace: React.FC<UserRoleScopeWorkspaceProps> = ({
  closeWorkspace,
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
  user = {} as User,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { userRoleScopeFormSchema } = UserRoleScopeFormSchema();
  const { stockOperations, loadingStock } = useStockOperationTypes();
  const { stockLocations } = useStockTagLocations();
  const { rolesConfig, error } = useSystemUserRoleConfigSetting();
  const { items, loadingRoleScope } = useUserRoleScopes();

  const [userRoleScopeInitialValues, setUserRoleScopeInitialValues] = useState<UserRoleScope | null>(null);
  const handleEditUserRoleScope = useCallback((userRoleScope: UserRoleScope) => {
    setUserRoleScopeInitialValues(userRoleScope);
  }, []);

  type UserRoleScopeFormSchema = z.infer<typeof userRoleScopeFormSchema>;

  const userRoleScopedefaultValues = useMemo(
    () => ({
      forms: userRoleScopeInitialValues
        ? [
            {
              ...userRoleScopeInitialValues,
              userName: user?.username || userRoleScopeInitialValues?.userName,
              dateRange: {
                activeTo: formatNewDate(userRoleScopeInitialValues?.activeTo),
                activeFrom: formatNewDate(userRoleScopeInitialValues?.activeFrom),
              },
              locations:
                userRoleScopeInitialValues?.locations?.map(({ locationName, locationUuid }) => ({
                  locationName,
                  locationUuid,
                })) || [],
              operationTypes:
                userRoleScopeInitialValues?.operationTypes?.map(({ operationTypeName, operationTypeUuid }) => ({
                  operationTypeName,
                  operationTypeUuid,
                })) || [],
            },
          ]
        : [],
    }),
    [userRoleScopeInitialValues, user],
  );

  const roleScopeformMethods = useForm<UserRoleScopeFormSchema>({
    resolver: zodResolver(userRoleScopeFormSchema),
    mode: 'all',
    defaultValues: userRoleScopedefaultValues as UserRoleScopeFormSchema,
  });

  const { reset } = roleScopeformMethods;

  const { errors, isSubmitting, isDirty } = roleScopeformMethods.formState;
  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => isDirty);
    }
  }, [isDirty, promptBeforeClosing]);

  useEffect(() => {
    if (userRoleScopeInitialValues && !loadingStock) {
      reset(userRoleScopedefaultValues as UserRoleScopeFormSchema);
    }
  }, [userRoleScopedefaultValues, loadingStock, userRoleScopeInitialValues, user, reset]);
  const {
    fields: forms,
    append: appendForm,
    remove: removeForm,
  } = useFieldArray({
    control: roleScopeformMethods.control,
    name: 'forms',
  });

  const mappedRoleScopeForms = (form) => ({
    uuid: userRoleScopeInitialValues?.uuid,
    userUuid: userRoleScopeInitialValues?.userUuid || user?.uuid,
    userName: userRoleScopeInitialValues?.userName,
    userGivenName: userRoleScopeInitialValues?.userGivenName,
    userFamilyName: userRoleScopeInitialValues?.userFamilyName,
    permanent: form?.permanent,
    enabled: form?.enabled,
    operationTypes: form?.operationTypes?.map(({ operationTypeUuid, operationTypeName }) => ({
      operationTypeUuid,
      operationTypeName,
    })),
    locations: form?.locations?.map(({ locationUuid, locationName }) => ({
      locationUuid,
      locationName,
      enableDescendants: false,
    })),
    role: form?.role,
    activeFrom: form?.dateRange?.activeFrom || null,
    activeTo: form?.dateRange?.activeTo || null,
  });

  const showNotification = (titleKey, subtitleKey, kind, params = {}) => {
    showSnackbar({
      title: t(titleKey),
      subtitle: t(subtitleKey, params),
      kind,
      isLowContrast: true,
    });
  };

  const onSubmit = async (data: UserRoleScopeFormSchema) => {
    try {
      const userRoleScopeUrl = userRoleScopeInitialValues?.uuid
        ? `${restBaseUrl}/stockmanagement/userrolescope/${userRoleScopeInitialValues.uuid}`
        : `${restBaseUrl}/stockmanagement/userrolescope`;

      await Promise.all(
        data.forms.map(async (form) => {
          const roleScope = mappedRoleScopeForms(form);
          const response = await createOrUpdateUserRoleScope(userRoleScopeUrl, roleScope, user?.uuid ?? '');
          if (response.ok) {
            showNotification('userRoleScopeSaved', 'User role scope saved successfully', 'success');
            closeWorkspaceWithSavedChanges();
          }
        }),
      );

      handleMutation(`${restBaseUrl}/stockmanagement/userrolescope`);
    } catch (error) {
      const errorMessage =
        error?.responseBody?.error?.message ?? 'An error occurred while creating the User role scope';
      showNotification('userRoleScopeCreationFailed', 'User role scope failed to save successfully', 'error', {
        errorMessage,
      });
    }
  };

  const handleError = (error) => {
    console.error('Error:', error);
    showSnackbar({
      title: t('userRoleScopeCreationFailed', 'User Role Scope creation failed'),
      subtitle: t(
        'userRoleScopeCreationFailedSubtitle',
        'An error occurred while creating the user role scope mode. Please try again.',
      ),
      kind: 'error',
      isLowContrast: true,
    });
  };

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => isDirty);
    }
  }, [isDirty, promptBeforeClosing]);

  function extractInventoryRoleNames(rolesConfig) {
    return rolesConfig.find((category) => category.category === ROLE_CATEGORIES.CORE_INVENTORY)?.roles || [];
  }

  const inventoryRoleNames = useMemo(() => extractInventoryRoleNames(rolesConfig || []), [rolesConfig]);

  const inventoryRoles = useMemo(() => {
    if (!user?.roles || inventoryRoleNames.length === 0) {
      return [];
    }
    return user.roles.filter((role) => inventoryRoleNames.includes(role.display));
  }, [user?.roles, inventoryRoleNames]);

  const scopeRoles = useMemo(
    () =>
      items?.results?.reduce((acc, role) => {
        if (role.userUuid === user.uuid) {
          acc.push(role.role);
        }
        return acc;
      }, []) || [],
    [items, user.uuid],
  );

  const filteredInventoryRoles = useMemo(() => {
    if (!user?.roles) {
      return [];
    }
    return user.uuid ? inventoryRoles.filter((role) => !scopeRoles.includes(role.display)) : inventoryRoles;
  }, [user?.roles, user.uuid, inventoryRoles, scopeRoles]);

  const hasInventoryRole = useMemo(
    () => filteredInventoryRoles.length > 0 && user.roles.some((role) => filteredInventoryRoles.includes(role)),
    [user.roles, filteredInventoryRoles],
  );

  return (
    <>
      <div>
        <StockUserRoleScopesList onEditUserRoleScope={handleEditUserRoleScope} user={user} />
      </div>
      {userRoleScopedefaultValues && (
        <FormProvider {...roleScopeformMethods}>
          <form onSubmit={roleScopeformMethods.handleSubmit(onSubmit, handleError)} className={styles.form}>
            <div className={styles.formContainer}>
              <Stack className={styles.formStackControl} gap={7}>
                <ResponsiveWrapper>
                  <CardHeader
                    title={
                      userRoleScopeInitialValues
                        ? t('editRoleScope', 'Edit User Role Scope')
                        : t('addRoleScope', 'Add a new user role scope')
                    }>
                    <ChevronSortUp />
                  </CardHeader>
                </ResponsiveWrapper>
                <div className={styles.roleStockFields}>
                  <ResponsiveWrapper>
                    <TextInput
                      readOnly={true}
                      id="userName"
                      labelText={t('username', 'Username')}
                      value={user?.username || userRoleScopeInitialValues?.userName}
                    />
                  </ResponsiveWrapper>
                </div>

                {forms.map((field, index) => (
                  <UserRoleScopeFormFields
                    key={field.id}
                    field={field}
                    index={index}
                    control={roleScopeformMethods.control}
                    removeForm={removeForm}
                    filteredInventoryRoles={filteredInventoryRoles}
                    hasInventoryRole={hasInventoryRole}
                    stockOperations={stockOperations}
                    stockLocations={stockLocations}
                    loadingStock={loadingStock}
                    roleScopeformMethods={roleScopeformMethods}
                    userRoleScopeInitialValues={userRoleScopeInitialValues}
                  />
                ))}
                {!userRoleScopeInitialValues && (
                  <div>
                    <div className={styles.roleStockFields}>
                      {!hasInventoryRole && <EmptyState displayText={t('noUserRole', 'No user role')} headerTitle="" />}
                      <Button
                        size="sm"
                        kind="tertiary"
                        renderIcon={Add}
                        onClick={() => appendForm({})}
                        disabled={!hasInventoryRole}>
                        {t('addAnotherRoleScope', 'Add user role scope')}
                      </Button>
                    </div>
                  </div>
                )}
              </Stack>
            </div>
            <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
              <Button style={{ maxWidth: '50%' }} kind="secondary" onClick={closeWorkspace}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button
                disabled={isSubmitting || Object.keys(errors).length > 0}
                style={{ maxWidth: '50%' }}
                kind="primary"
                type="submit">
                {isSubmitting ? (
                  <span style={{ display: 'flex', justifyItems: 'center' }}>
                    {t('submitting', 'Submitting...')} <InlineLoading status="active" iconDescription="Loading" />
                  </span>
                ) : (
                  t('saveAndClose', 'Save & close')
                )}
              </Button>
            </ButtonSet>
          </form>
        </FormProvider>
      )}
    </>
  );
};

export default UserRoleScopeWorkspace;
