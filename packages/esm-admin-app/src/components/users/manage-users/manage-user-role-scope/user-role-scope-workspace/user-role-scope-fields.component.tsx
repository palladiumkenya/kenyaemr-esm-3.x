import React, { useEffect } from 'react';
import { Control, Controller, useFormContext, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './user-role-fields.scss';
import { formatDatetime, ResponsiveWrapper } from '@openmrs/esm-framework';
import {
  DatePickerInput,
  InlineLoading,
  Button,
  ComboBox,
  CheckboxGroup,
  Column,
  Tile,
  DatePicker,
} from '@carbon/react';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, today } from '../../../../../constants';
import { Role, StockOperationType, UserRoleScope } from '../../../../../types';

type UserRoleScopeFields = {
  field: Record<string, any>;
  index: number;
  control: Control<Record<string, any>>;
  removeForm: (index: number) => void;
  filteredInventoryRoles: Array<Role>;
  hasInventoryRole: boolean;
  stockOperations: Array<StockOperationType>;
  loadingStock: boolean;
  stockLocations: Array<fhir.Location>;
  roleScopeformMethods: any;
  userRoleScopeInitialValues: UserRoleScope;
};
const MinDate: Date = today();

const UserRoleScopeFormFields: React.FC<UserRoleScopeFields> = ({
  field,
  index,
  control,
  removeForm,
  filteredInventoryRoles,
  hasInventoryRole,
  stockOperations,
  loadingStock,
  stockLocations,
  roleScopeformMethods,
  userRoleScopeInitialValues,
}) => {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const enabled = watch(`forms.${index}.enabled`);
  const permanent = watch(`forms.${index}.permanent`);

  const handlePermissionDurationChange = (e, field, setValue) => {
    const isChecked = e.target.checked;
    field.onChange(isChecked);

    if (isChecked) {
      setValue(`forms.${index}.dateRange`, { activeFrom: undefined, activeTo: undefined });
    }
  };

  useEffect(() => {
    if (permanent) {
      setValue(`forms.${index}.dateRange`, { activeFrom: undefined, activeTo: undefined });
    }
  }, [permanent, setValue, index]);

  return (
    <div className={styles.roleStockFields}>
      <ResponsiveWrapper>
        <Controller
          name={`forms.${index}.role`}
          control={control}
          render={({ field }) => (
            <ComboBox
              {...field}
              id="role"
              items={filteredInventoryRoles}
              itemToString={(item) => item?.display?.trim() || ''}
              placeholder={t('chooseAStockRole', 'Choose a stock role')}
              titleText={t('stockRole', 'Stock Role')}
              selectedItem={filteredInventoryRoles.find((item) => item?.display === field.value) || null}
              onChange={({ selectedItem }) => {
                field.onChange(selectedItem ? selectedItem.display.trim() : '');
              }}
              disabled={userRoleScopeInitialValues}
            />
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper>
        <Column xsm={8} md={12} lg={12} className={styles.checkBoxColumn}>
          <CheckboxGroup legendText={t('stockRoleAccess', 'Stock Role Access')} className={styles.checkboxGroupGrid}>
            <Controller
              name={`forms.${index}.enabled`}
              control={control}
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
            {enabled && (
              <Controller
                name={`forms.${index}.permanent`}
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="permanent">
                      <input
                        type="checkbox"
                        id="permanent"
                        name="permanent"
                        checked={field.value || false}
                        onChange={(e) => handlePermissionDurationChange(e, field, roleScopeformMethods.setValue)}
                      />
                      {t('permanent', 'Permanent?')}
                    </label>
                  </div>
                )}
              />
            )}
          </CheckboxGroup>
          {!permanent && enabled && (
            <ResponsiveWrapper>
              <Tile>
                <Controller
                  name={`forms.${index}.dateRange`}
                  control={control}
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
        <Column key={t('stockOperation', 'Stock Operation')} xsm={8} md={12} lg={12} className={styles.checkBoxColumn}>
          <CheckboxGroup legendText={t('stockOperation', 'Stock Operation')} className={styles.checkboxGroupGrid}>
            {loadingStock ? (
              <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
            ) : (
              <Controller
                name={`forms.${index}.operationTypes`}
                control={control}
                render={({ field }) => {
                  const selectedStockOperation = field.value || [];

                  const isSelected = (operationUuid: string) =>
                    selectedStockOperation.some((op) => op.operationTypeUuid === operationUuid);
                  const toggleOperation = (operation) => {
                    if (isSelected(operation.uuid)) {
                      field.onChange(selectedStockOperation.filter((op) => op.operationTypeUuid !== operation.uuid));
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
        <Column key={t('stockLocation', 'Stock Location')} xsm={8} md={12} lg={12} className={styles.checkBoxColumn}>
          <CheckboxGroup legendText={t('stockLocation', 'Stock Location')} className={styles.checkboxGroupGrid}>
            {loadingStock ? (
              <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
            ) : (
              <Controller
                name={`forms.${index}.locations`}
                control={control}
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
                            className={isSelected(location.id) ? styles.checkboxLabelSelected : styles.checkboxLabel}>
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
      {!userRoleScopeInitialValues && (
        <Button size="sm" kind="danger--tertiary" onClick={() => removeForm(index)}>
          {t('remove', 'Remove')}
        </Button>
      )}
    </div>
  );
};

export default UserRoleScopeFormFields;
