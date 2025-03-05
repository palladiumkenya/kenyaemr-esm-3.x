import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DefaultWorkspaceProps,
  formatDatetime,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
  User,
} from '@openmrs/esm-framework';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import styles from '../../../manage-users/user-management.workspace.scss';
import {
  TextInput,
  ButtonSet,
  Button,
  InlineLoading,
  Stack,
  Column,
  Tile,
  ComboBox,
  DatePickerInput,
  DatePicker,
  CheckboxGroup,
} from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { UserRoleScope } from '../../../../../config-schema';
import UserRoleScopeFormSchema from './userRoleScopeFormSchema';
import {
  createOrUpdateUserRoleScope,
  handleMutation,
  useStockOperationTypes,
  useStockTagLocations,
} from '../../../../../user-management.resources';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, formatNewDate, today } from '../../../../../constants';
import { CardHeader } from '@openmrs/esm-patient-common-lib/src';
import { ChevronSortUp } from '@carbon/react/icons';

type UserRoleScopeWorkspaceProps = DefaultWorkspaceProps & {
  userRoleScopeInitialValues?: UserRoleScope;
};
const MinDate: Date = today();

const UserRoleScopeWorkspace: React.FC<UserRoleScopeWorkspaceProps> = ({
  closeWorkspace,
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
  userRoleScopeInitialValues = {} as UserRoleScope,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { userRoleScopeFormSchema } = UserRoleScopeFormSchema();
  const { stockOperations, loadingStock } = useStockOperationTypes();
  const { stockLocations } = useStockTagLocations();

  const isInitialValuesEmpty = Object.keys(userRoleScopeInitialValues).length === 0;
  type UserRoleScopeFormSchema = z.infer<typeof userRoleScopeFormSchema>;
  const formDefaultValues = useMemo(() => {
    if (isInitialValuesEmpty) {
      return {};
    }
    return {
      ...userRoleScopeInitialValues,
      dateRange: {
        activeTo: formatNewDate(userRoleScopeInitialValues?.activeTo),
        activeFrom: formatNewDate(userRoleScopeInitialValues?.activeFrom),
      },
      operationLocation:
        userRoleScopeInitialValues?.locations?.map(({ locationName, locationUuid }) => ({
          locationName,
          locationUuid,
        })) || [],
      stockOperation:
        userRoleScopeInitialValues?.operationTypes?.map(({ operationTypeName, operationTypeUuid }) => ({
          operationTypeName,
          operationTypeUuid,
        })) || [],
    };
  }, [userRoleScopeInitialValues]);

  const roleScopeformMethods = useForm<UserRoleScopeFormSchema>({
    resolver: zodResolver(userRoleScopeFormSchema),
    mode: 'all',
    defaultValues: formDefaultValues,
  });

  const { reset } = roleScopeformMethods;

  const { errors, isSubmitting, isDirty } = roleScopeformMethods.formState;

  useEffect(() => {
    if (userRoleScopeInitialValues && !loadingStock) {
      reset(formDefaultValues);
    }
  }, [formDefaultValues, loadingStock, userRoleScopeInitialValues]);

  const onSubmit = async (data: UserRoleScopeFormSchema) => {
    if (!userRoleScopeInitialValues) {
      console.error('Initial user role scope mode is not set.');
      return;
    }

    const payload: Partial<UserRoleScope> = {
      uuid: userRoleScopeInitialValues.uuid,
      userName: data.userName,
      userGivenName: userRoleScopeInitialValues.userGivenName,
      userFamilyName: userRoleScopeInitialValues.userFamilyName,
      role: data.role,
      permanent: data.permanent,
      activeFrom: data.dateRange.activeFrom,
      activeTo: data.dateRange.activeTo,
      enabled: data.enabled,
      locations: data.operationLocation?.map((loc) => ({
        locationUuid: loc.locationUuid,
        locationName: loc.locationName,
        enableDescendants: false,
      })),
      operationTypes: data.stockOperation?.map((op) => ({
        operationTypeUuid: op.operationTypeUuid,
        operationTypeName: op.operationTypeName,
      })),
    };

    try {
      const userRoleScopeUrl = userRoleScopeInitialValues?.uuid
        ? `${restBaseUrl}/stockmanagement/userrolescope/${userRoleScopeInitialValues.uuid}`
        : `${restBaseUrl}/stockmanagement/userrolescope`;
      const response = await createOrUpdateUserRoleScope(
        userRoleScopeUrl,
        payload,
        userRoleScopeInitialValues?.userUuid ?? '',
      );
      if (response.ok) {
        showSnackbar({
          title: t('userRoleScopeSaved', 'User role scope saved successfully'),
          subtitle: t('userRoleScopeCreatedSubtitle', 'User role scope has been created successfully'),
          kind: 'success',
          isLowContrast: true,
        });
        closeWorkspaceWithSavedChanges();
        handleMutation(`${restBaseUrl}/stockmanagement/userrolescope`);
      }
    } catch (error) {
      const errorObject = error?.responseBody?.error;
      const errorMessage = errorObject?.message ?? 'An error occurred while creating the User role scope';
      showSnackbar({
        title: t('userRoleScopeCreationFailed', 'User role scope creation failed'),
        subtitle: t(
          'userRoleScopeCreationFailedSubtitle',
          'An error occurred while creating the user role scope {{errorMessage}}',
          { errorMessage },
        ),
        kind: 'error',
        isLowContrast: true,
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

  return (
    <FormProvider {...roleScopeformMethods}>
      <form onSubmit={roleScopeformMethods.handleSubmit(onSubmit, handleError)} className={styles.form}>
        <div className={styles.formContainer}>
          <Stack className={styles.formStackControl} gap={7}>
            <ResponsiveWrapper>
              <CardHeader title={t('additionalRoles', 'Edit User Roles Scope')}>
                <ChevronSortUp />
              </CardHeader>
              <ResponsiveWrapper>
                <Controller
                  name="userName"
                  control={roleScopeformMethods.control}
                  render={({ field }) => <TextInput {...field} id="userName" labelText={t('username', 'Username')} />}
                />
              </ResponsiveWrapper>
              <ResponsiveWrapper>
                <Controller
                  name="role"
                  control={roleScopeformMethods.control}
                  render={({ field }) => (
                    <ComboBox
                      {...field}
                      id="role"
                      items={field}
                      itemToString={(item) => item?.display?.trim() || ''}
                      titleText={t('userRoleScope', 'Role')}
                      selectedItem={field}
                      onChange={({ selectedItem }) => {
                        field.onChange(selectedItem ? selectedItem.display.trim() : '');
                      }}
                    />
                  )}
                />
              </ResponsiveWrapper>
              <ResponsiveWrapper>
                <Column xsm={8} md={12} lg={12} className={styles.checkBoxColumn}>
                  <CheckboxGroup legendText={t('inventoryUser', 'Inventory User')} className={styles.checkboxGroupGrid}>
                    <Controller
                      name="enabled"
                      control={roleScopeformMethods.control}
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
                    {roleScopeformMethods?.watch('enabled') && (
                      <Controller
                        name="permanent"
                        control={roleScopeformMethods.control}
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
                                    roleScopeformMethods.setValue('dateRange', {
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
                  {!roleScopeformMethods?.watch('permanent') && roleScopeformMethods?.watch('enabled') && (
                    <ResponsiveWrapper>
                      <Tile>
                        <Controller
                          name="dateRange"
                          control={roleScopeformMethods.control}
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
                      <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
                    ) : (
                      <Controller
                        name="stockOperation"
                        control={roleScopeformMethods.control}
                        render={({ field }) => {
                          const selectedStockOperation = field.value || [];

                          const isSelected = (operationUuid: string) =>
                            selectedStockOperation.some((op) => op.operationTypeUuid === operationUuid);
                          const toggleOperation = (operation) => {
                            if (isSelected(operation.uuid)) {
                              field.onChange(
                                selectedStockOperation.filter((op) => op.operationTypeUuid !== operation.uuid),
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
                                        isSelected(operation.uuid) ? styles.checkboxLabelSelected : styles.checkboxLabel
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
                <Column key={t('location', 'Stock Location')} xsm={8} md={12} lg={12} className={styles.checkBoxColumn}>
                  <CheckboxGroup legendText={t('stockLocation', 'Stock Location')} className={styles.checkboxGroupGrid}>
                    {loadingStock ? (
                      <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
                    ) : (
                      <Controller
                        name="operationLocation"
                        control={roleScopeformMethods.control}
                        render={({ field }) => {
                          const selectedLocations = field.value || [];

                          const isSelected = (locationUuid: string) =>
                            selectedLocations.some((loc) => loc.locationUuid === locationUuid);
                          const toggleLocation = (location) => {
                            if (isSelected(location.id)) {
                              field.onChange(selectedLocations.filter((loc) => loc.locationUuid !== location.id));
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
                                      isSelected(location.id) ? styles.checkboxLabelSelected : styles.checkboxLabel
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
            </ResponsiveWrapper>
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
  );
};

export default UserRoleScopeWorkspace;
