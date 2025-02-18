import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ButtonSet,
  Button,
  Stack,
  TextInput,
  ComboBox,
  Toggle,
  InlineNotification,
  InlineLoading,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { Controller, useFieldArray, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useLayoutType, useDebounce, ResponsiveWrapper, showSnackbar, restBaseUrl } from '@openmrs/esm-framework';
import { DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';

import { createBillableService, useConceptsSearch, useServiceTypes } from '../../billable-service.resource';
import PriceField from './price.component';
import { billableFormSchema, BillableFormSchema } from '../form-schemas';

import classNames from 'classnames';
import styles from './service-form.scss';
import { formatBillableServicePayloadForSubmission, mapInputToPayloadSchema } from '../form-helper';
import ConceptSearch from './concept-search.component';
import { handleMutate } from '../../utils';

interface AddServiceFormProps extends DefaultPatientWorkspaceProps {
  initialValues?: BillableFormSchema;
}

const AddServiceForm: React.FC<AddServiceFormProps> = ({
  closeWorkspace,
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
  initialValues,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [conceptToLookup, setConceptToLookup] = useState('');
  const debouncedConceptToLookup = useDebounce(conceptToLookup, 500);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const inEditMode = !!initialValues;

  const { isLoading: isLoadingServiceTypes, serviceTypes } = useServiceTypes();
  const { isSearching, searchResults: concepts } = useConceptsSearch(debouncedConceptToLookup);
  const formMethods = useForm<BillableFormSchema>({
    resolver: zodResolver(billableFormSchema),
    defaultValues: initialValues
      ? mapInputToPayloadSchema(initialValues)
      : { servicePrices: [], serviceStatus: 'ENABLED' },
  });

  const {
    setValue,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isDirty, defaultValues, isSubmitting },
  } = formMethods;

  useEffect(() => {
    if (initialValues) {
      setConceptToLookup(initialValues.concept?.concept?.display);
      trigger();
    }
  }, [initialValues, trigger]);

  const {
    fields: servicePriceFields,
    append: appendServicePrice,
    remove: removeServicePrice,
  } = useFieldArray({
    control,
    name: 'servicePrices',
  });

  const handleSelectConcept = (concept) => {
    setSelectedConcept(concept);
    setValue('concept', concept);
    setConceptToLookup('');
  };

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const onSubmit = async (data: BillableFormSchema) => {
    const formPayload = formatBillableServicePayloadForSubmission(data, initialValues?.['uuid']);
    try {
      const response = await createBillableService(formPayload);
      if (response.ok) {
        showSnackbar({
          title: inEditMode
            ? t('serviceUpdatedSuccessfully', 'Service updated successfully')
            : t('serviceCreated', 'Service created successfully'),
          kind: 'success',
          subtitle: inEditMode
            ? t('serviceUpdatedSuccessfully', 'Service updated successfully')
            : t('serviceCreatedSuccessfully', 'Service created successfully'),
          isLowContrast: true,
          timeoutInMs: 5000,
        });
        handleMutate(`${restBaseUrl}/cashier/billableService?v`);

        closeWorkspaceWithSavedChanges();
      }
    } catch (e) {
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: inEditMode
          ? t('serviceUpdateFailed', 'Service failed to update')
          : t('serviceCreationFailed', 'Service creation failed'),
        isLowContrast: true,
        timeoutInMs: 5000,
      });
    }
  };

  const renderServicePriceFields = useMemo(
    () =>
      servicePriceFields.map((field, index) => (
        <PriceField
          key={field.id}
          field={field}
          index={index}
          control={control}
          removeServicePrice={removeServicePrice}
          errors={errors}
        />
      )),
    [servicePriceFields, control, removeServicePrice, errors],
  );

  const handleError = (err) => {
    console.error(JSON.stringify(err, null, 2));
    showSnackbar({
      title: t('serviceCreationFailed', 'Service creation failed'),
      subtitle: t(
        'serviceCreationFailedSubtitle',
        'The service creation failed, view browser console for more details',
      ),
      kind: 'error',
      isLowContrast: true,
      timeoutInMs: 5000,
    });
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit, handleError)} className={styles.form}>
        <div className={styles.formContainer}>
          <Stack className={styles.formStackControl} gap={7}>
            {errors.concept && (
              <InlineNotification
                kind="error"
                title={t('conceptMissing', 'Concept missing')}
                subtitle={t('conceptMissingSubtitle', 'Please select a stock item')}
              />
            )}
            <ResponsiveWrapper>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    type="text"
                    labelText={t('serviceName', 'Service name')}
                    invalid={!!errors.name}
                    invalidText={errors?.name?.message}
                  />
                )}
              />
            </ResponsiveWrapper>
            <ResponsiveWrapper>
              <Controller
                name="shortName"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    type="text"
                    labelText={t('serviceShortName', 'Service short name')}
                    invalid={!!errors.shortName}
                    invalidText={errors?.shortName?.message}
                  />
                )}
              />
            </ResponsiveWrapper>

            <ConceptSearch
              selectedConcept={selectedConcept}
              setConceptToLookup={setConceptToLookup}
              conceptToLookup={conceptToLookup}
              defaultValues={defaultValues}
              errors={errors}
              isSearching={isSearching}
              concepts={concepts}
              handleSelectConcept={handleSelectConcept}
            />

            <ResponsiveWrapper>
              <Controller
                name="serviceType"
                control={control}
                render={({ field }) => {
                  return (
                    <ComboBox
                      onChange={({ selectedItem }) => field.onChange(selectedItem)}
                      titleText={t('serviceType', 'Service type')}
                      items={serviceTypes ?? []}
                      itemToString={(item) => (item ? item.display : '')}
                      placeholder={t('selectServiceType', 'Select service type')}
                      disabled={isLoadingServiceTypes}
                      initialSelectedItem={field.value}
                      invalid={!!errors.serviceType}
                      invalidText={errors?.serviceType?.message}
                    />
                  );
                }}
              />
            </ResponsiveWrapper>
            <ResponsiveWrapper>
              <Controller
                control={control}
                name="serviceStatus"
                render={({ field }) => (
                  <Toggle
                    labelText={t('status', 'Status')}
                    labelA="Off"
                    labelB="On"
                    defaultToggled={field.value === 'ENABLED'}
                    id="serviceStatus"
                    onToggle={(value) => (value ? field.onChange('ENABLED') : field.onChange('DISABLED'))}
                  />
                )}
              />
            </ResponsiveWrapper>
            {renderServicePriceFields}
            <Button size="sm" kind="tertiary" renderIcon={Add} onClick={() => appendServicePrice({})}>
              {t('addPaymentMethod', 'Add payment method')}
            </Button>
            {!!errors.servicePrices && (
              <InlineNotification
                aria-label="closes notification"
                kind="error"
                lowContrast={true}
                statusIconDescription="notification"
                title={t('paymentMethodRequired', 'Payment method required')}
                subTitle={t('atLeastOnePriceRequired', 'At least one price is required')}
              />
            )}
          </Stack>
        </div>
        <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
          <Button style={{ maxWidth: '50%' }} kind="secondary" onClick={closeWorkspace}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={isSubmitting || !isDirty} style={{ maxWidth: '50%' }} kind="primary" type="submit">
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

export default AddServiceForm;
