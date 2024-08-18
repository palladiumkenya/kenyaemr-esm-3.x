import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './add-billable-service.scss';
import {
  Form,
  Button,
  TextInput,
  ComboBox,
  Dropdown,
  Layer,
  InlineLoading,
  Search,
  Tile,
  FormLabel,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  createBillableService,
  useConceptsSearch,
  usePaymentModes,
  useServiceTypes,
} from '../billable-service.resource';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Add, TrashCan, WarningFilled } from '@carbon/react/icons';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate, selectPreferredName, showSnackbar, useDebounce, useLayoutType } from '@openmrs/esm-framework';
import { ServiceConcept } from '../../types';
import { extractErrorMessagesFromResponse } from '../../utils';

const servicePriceSchema = z.object({
  uuid: z.string({ required_error: 'Payment method is required' }),
  paymentMode: z.string({ required_error: 'Payment method is required' }),
  price: z
    .string()
    .refine((value) => !isNaN(Number(value)), 'Value must be a number')
    .refine((value) => parseInt(value) > 0, 'Price should be a number more than zero')
    .refine((value) => !!value, 'Price is required'),
});

const paymentFormSchema = z.object({
  payment: z.array(servicePriceSchema).min(1, 'At least one payment method is required'),
  serviceName: z.string({
    required_error: 'Service name is required',
  }),
  shortName: z.string({ required_error: 'A valid short name is required.' }),
  serviceTypeName: z.string({ required_error: 'A service type is required' }),
  concept: z.string({ required_error: 'Concept search is required.' }),
});

export type FormData = z.infer<typeof paymentFormSchema>;
const DEFAULT_PAYMENT_OPTION = { paymentMode: '', price: '1', uuid: null };
type AddBillableServiceProps = {
  initialValues: FormData;
  serviceId: string;
  serviceConcept: any;
};
const EditBillableService: React.FC<AddBillableServiceProps> = ({ initialValues, serviceId, serviceConcept }) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (!serviceId) {
      handleRedirectToAddService();
    }
  }, [serviceId, navigate]);

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();
  const { serviceTypes, isLoading: isLoadingServicesTypes } = useServiceTypes();
  const [validPaymentModes, setValidPaymentModes] = useState(paymentModes);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'all',
    defaultValues: initialValues ?? { payment: [DEFAULT_PAYMENT_OPTION] },
    resolver: zodResolver(paymentFormSchema),
  });
  const { fields, remove, append } = useFieldArray({ name: 'payment', control: control });

  const handleAppendPaymentMode = useCallback(() => append(DEFAULT_PAYMENT_OPTION), [append]);
  const handleRemovePaymentMode = useCallback((index) => remove(index), [remove]);

  const isTablet = useLayoutType() === 'tablet';
  const searchInputRef = useRef(null);
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);

  const [selectedConcept, setSelectedConcept] = useState<ServiceConcept>(serviceConcept ?? null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const { searchResults, isSearching } = useConceptsSearch(debouncedSearchTerm);

  const getValidPaymentModes = (allPaymentModes) => {
    const setModes = control?._formValues?.payment ?? [];
    const newPaymentModes = [];

    allPaymentModes.forEach((element) => {
      // Check if any object in setModes has the same paymentMode as the current element
      const isModePresent = setModes.some((mode) => mode.paymentMode === element.uuid);
      if (!isModePresent) {
        newPaymentModes.push(element);
      }
    });
    return newPaymentModes;
  };

  const handleConceptChange = useCallback((selectedConcept: ServiceConcept) => {
    setSelectedConcept(selectedConcept);
  }, []);

  const handleNavigateToServiceDashboard = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + 'billable-services',
    });

  const handleRedirectToAddService = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + 'billable-services/add-service',
    });

  const onSubmit = (data: FormData) => {
    const payload: any = {};
    let servicePrices = data.payment.map((element) => {
      return {
        uuid: element.uuid,
        name: paymentModes.filter((p) => p.uuid === element.paymentMode)[0].name,
        price: element.price,
        paymentMode: element.paymentMode,
      };
    });

    payload.name = data.serviceName;
    payload.shortName = data.shortName;
    payload.serviceType = data.serviceTypeName;
    payload.servicePrices = servicePrices;
    payload.serviceStatus = 'ENABLED';
    payload.concept = selectedConcept?.concept?.uuid;
    payload.uuid = serviceId;

    createBillableService(payload).then(
      (resp) => {
        showSnackbar({
          title: t('billableService', 'Billable Service'),
          subtitle: 'Billable service updated successfully',
          kind: 'success',
          isLowContrast: true,
          timeoutInMs: 3000,
        });
        handleNavigateToServiceDashboard();
      },
      (error) => {
        showSnackbar({
          title: 'Error updating billable service',
          kind: 'error',
          subtitle: extractErrorMessagesFromResponse(error.responseBody),
          isLowContrast: true,
        });
      },
    );
  };

  if (isLoadingServicesTypes || isLoadingPaymentModes) {
    return (
      <div className={styles.searchWrapper}>
        <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />
      </div>
    );
  }

  return (
    <Form className={styles.form}>
      <h4 className={styles.subTitle}>{t('addBillableServices', 'Add Billable Services')}</h4>
      <section className={styles.nameSection}>
        <div className={styles.serviceName}>
          <Controller
            control={control}
            name="serviceName"
            render={({ field }) => (
              <Layer>
                <TextInput
                  {...field}
                  id="serviceName"
                  type="text"
                  labelText={t('serviceName', 'Service Name')}
                  size="md"
                  placeholder="Enter service name"
                  invalidText={errors.serviceName?.message || ''}
                  invalid={!!errors.serviceName}
                />
              </Layer>
            )}
          />
        </div>
        <div className={styles.serviceName}>
          <Controller
            control={control}
            name="shortName"
            render={({ field }) => (
              <Layer>
                <TextInput
                  id="serviceShortName"
                  {...field}
                  type="text"
                  labelText={t('serviceShortName', 'Short Name')}
                  size="md"
                  placeholder="Enter service short name"
                  invalidText={errors.shortName?.message}
                  invalid={!!errors.shortName}
                />
              </Layer>
            )}
          />
        </div>
      </section>
      <section className={styles.secondSection}>
        <div className={styles.serviceName}>
          <FormLabel className={styles.conceptLabel}>Associated Concept</FormLabel>
          <Controller
            name="concept"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <ResponsiveWrapper isTablet={isTablet}>
                <Search
                  ref={searchInputRef}
                  size="md"
                  id="conceptsSearch"
                  labelText={t('enterConcept', 'Associated concept')}
                  placeholder={t('searchConcepts', 'Search associated concept')}
                  className={errors?.concept && styles.serviceError}
                  onChange={(e) => {
                    onChange(e);
                    handleSearchTermChange(e);
                  }}
                  renderIcon={errors?.concept && <WarningFilled />}
                  onBlur={onBlur}
                  onClear={() => {
                    setSearchTerm('');
                    setSelectedConcept(null);
                  }}
                  value={selectedConcept ? selectedConcept.display : debouncedSearchTerm ? value : undefined}
                />
              </ResponsiveWrapper>
            )}
          />
          {(() => {
            if (!debouncedSearchTerm || selectedConcept) {
              return null;
            }
            if (isSearching) {
              return (
                <div className={styles.searchWrapper}>
                  <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />
                </div>
              );
            }
            if (searchResults && searchResults.length) {
              return (
                <ul className={styles.conceptsList}>
                  {searchResults?.map((searchResult, index) => (
                    <li
                      role="menuitem"
                      className={styles.service}
                      key={searchResult.concept.uuid}
                      onClick={() => handleConceptChange(searchResult)}>
                      {searchResult.display}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <Layer>
                <Tile className={styles.emptyResults}>
                  <span>
                    {t('noResultsFor', 'No results for')} <strong>"{debouncedSearchTerm}"</strong>
                  </span>
                </Tile>
              </Layer>
            );
          })()}
        </div>
        <div className={styles.serviceName}>
          <Controller
            control={control}
            name="serviceTypeName"
            render={({ field }) => {
              return (
                <ComboBox
                  id="serviceType"
                  items={serviceTypes ?? []}
                  titleText={t('serviceType', 'Service Type')}
                  itemToString={(item) => (item ? item.display : '')}
                  placeholder="Select service type"
                  initialSelectedItem={serviceTypes.find((item) => item.uuid == field.value) ?? null}
                  onChange={({ selectedItem }) => {
                    field.onChange(selectedItem ? selectedItem?.uuid : '');
                  }}
                  invalidText={errors.serviceTypeName?.message || ''}
                  invalid={!!errors.serviceTypeName}
                />
              );
            }}
          />
        </div>
      </section>
      <div>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.paymentMethodContainer}>
            <Controller
              control={control}
              name={`payment.${index}.paymentMode`}
              render={({ field }) => {
                return (
                  <Layer>
                    <Dropdown
                      id={`paymentMode-${index}`}
                      onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid)}
                      titleText={t('paymentMode', 'Payment Mode')}
                      label={t('selectPaymentMethod', 'Select payment method')}
                      items={getValidPaymentModes(paymentModes) ?? []}
                      itemToString={(item) => (item ? item.name : '')}
                      invalid={!!errors?.payment?.[index]?.paymentMode}
                      invalidText={errors?.payment?.[index]?.paymentMode?.message}
                      initialSelectedItem={paymentModes?.find((item) => item.uuid === field.value) || null}
                    />
                  </Layer>
                );
              }}
            />

            <Controller
              control={control}
              name={`payment.${index}.price`}
              render={({ field }) => (
                <Layer>
                  <TextInput
                    id={`price-${index}`}
                    {...field}
                    invalid={!!errors?.payment?.[index]?.price}
                    invalidText={errors?.payment?.[index]?.price?.message}
                    labelText={t('sellingPrice', 'Selling Price')}
                    placeholder={t('sellingAmount', 'Enter selling price')}
                  />
                </Layer>
              )}
            />
            <div className={styles.removeButtonContainer}>
              <TrashCan
                aria-label={`delete_${index}`}
                id={`delete_${index}`}
                onClick={() => handleRemovePaymentMode(index)}
                className={styles.removeButton}
                size={20}
              />
            </div>
          </div>
        ))}

        <Button
          size="md"
          onClick={handleAppendPaymentMode}
          className={styles.paymentButtons}
          renderIcon={(props) => <Add size={24} {...props} />}
          iconDescription="Add">
          {t('addPaymentOptions', 'Add payment option')}
        </Button>
      </div>
      <section>
        <Button kind="secondary" onClick={handleNavigateToServiceDashboard}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={!isValid || !selectedConcept}>
          {t('save', 'Save')}
        </Button>
      </section>
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

export default EditBillableService;
