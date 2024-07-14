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
import { navigate, showSnackbar, useDebounce, useLayoutType } from '@openmrs/esm-framework';
import { ServiceConcept } from '../../types';
import { extractErrorMessagesFromResponse } from '../../utils';

const servicePriceSchema = z.object({
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

type FormData = z.infer<typeof paymentFormSchema>;
const DEFAULT_PAYMENT_OPTION = { paymentMode: '', price: '1' };

const UpdateBillableServicesDialog: React.FC<{ closeWorkspace: () => void; initialData: any }> = ({
  closeWorkspace,
  initialData,
}) => {
  const { t } = useTranslation();

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();
  const { serviceTypes, isLoading: isLoadingServicesTypes } = useServiceTypes();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      serviceName: initialData?.name || '',
      shortName: initialData?.shortName || '',
      serviceTypeName: initialData?.serviceType?.display || '',
      concept: initialData?.concept?.display || '',
      payment: initialData?.servicePrices?.map((price) => ({
        paymentMode: price.paymentMode,
        price: price.price.toString(),
      })) || [DEFAULT_PAYMENT_OPTION],
    },
    resolver: zodResolver(paymentFormSchema),
  });

  const { fields, remove, append } = useFieldArray({ name: 'payment', control: control });

  const handleAppendPaymentMode = useCallback(() => append(DEFAULT_PAYMENT_OPTION), [append]);
  const handleRemovePaymentMode = useCallback((index) => remove(index), [remove]);

  const isTablet = useLayoutType() === 'tablet';
  const searchInputRef = useRef(null);
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);

  const [selectedConcept, setSelectedConcept] = useState<ServiceConcept>(initialData?.concept);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const { searchResults, isSearching } = useConceptsSearch(debouncedSearchTerm);

  const handleConceptChange = useCallback((selectedConcept: ServiceConcept) => {
    setSelectedConcept(selectedConcept);
  }, []);

  const handleNavigateToServiceDashboard = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + 'billable-services',
    });

  const onSubmit = (data: FormData) => {
    const payload: any = {};

    let servicePrices = data.payment
      ? data.payment.map((element) => {
          return {
            name: paymentModes.find((p) => p.uuid === element.paymentMode)?.name || '',
            price: element.price.toString(),
            paymentMode: element.paymentMode,
          };
        })
      : [];

    payload.name = data.serviceName;
    payload.shortName = data.shortName;
    payload.serviceType = data.serviceTypeName;
    payload.servicePrices = servicePrices;
    payload.serviceStatus = 'ENABLED';
    payload.concept = selectedConcept?.concept?.uuid;
    payload.uuid = initialData.uuid;

    createBillableService(payload).then(
      (resp) => {
        showSnackbar({
          title: t('billableService', 'Billable service'),
          subtitle: 'Billable service updated successfully',
          kind: 'success',
          isLowContrast: true,
          timeoutInMs: 3000,
        });
        closeWorkspace();
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

  useEffect(() => {
    if (initialData) {
      setValue('serviceName', initialData.name);
      setValue('shortName', initialData.shortName);
      setValue('serviceTypeName', initialData.serviceType.display);
      setValue('concept', initialData.concept?.display || '');
      setValue(
        'payment',
        initialData.servicePrices.map((price) => ({
          paymentMode: paymentModes.find((mode) => mode.uuid === price.paymentMode),
          price: price.price.toString(),
        })),
      );
    }
  }, [initialData, setValue, paymentModes]);

  if (isLoadingServicesTypes || isLoadingPaymentModes) {
    return (
      <div className={styles.searchWrapper}>
        <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h4>{t('updateBillableService', 'Update Billable Service')}</h4>
      <section className={`${styles.section} ${styles.scrollableContent}`}>
        <section className={styles.section}>
          <Layer>
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
          </Layer>
          <Layer>
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
          </Layer>
          <Layer>
            <Controller
              control={control}
              name="serviceTypeName"
              render={({ field }) => (
                <ComboBox
                  id="serviceType"
                  items={serviceTypes ?? []}
                  titleText={t('serviceType', 'Service Type')}
                  itemToString={(item: { display: string }) => (item ? item.display : '')}
                  placeholder="Select service type"
                  required
                  {...field}
                  onChange={({ selectedItem }) => field.onChange(selectedItem ? selectedItem.display : '')}
                  invalidText={errors.serviceTypeName?.message || ''}
                  invalid={!!errors.serviceTypeName}
                />
              )}
            />
          </Layer>
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
                  value={(() => {
                    if (selectedConcept) {
                      return selectedConcept.display;
                    }
                    if (debouncedSearchTerm) {
                      return value;
                    }
                  })()}
                />
              </ResponsiveWrapper>
            )}
          />
          {(() => {
            if (!debouncedSearchTerm || selectedConcept) {
              return null;
            }
            if (isSearching) {
              return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
            }
            if (searchResults && searchResults.length) {
              return (
                <ul className={styles.conceptsList}>
                  {searchResults?.map((searchResult, index) => (
                    <li
                      role="menuitem"
                      className={styles.service}
                      key={index}
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
          {fields.map((field, index) => (
            <div key={field.id} className={styles.paymentMethodContainer}>
              <Controller
                control={control}
                name={`payment.${index}.paymentMode`}
                render={({ field }) => (
                  <Layer>
                    <Dropdown
                      id={`paymentMode-${index}`}
                      onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid)}
                      titleText={t('paymentMode', 'Payment Mode')}
                      label={t('selectPaymentMethod', 'Select payment method')}
                      items={paymentModes ?? []}
                      itemToString={(item) => (item ? item.name : '')}
                      invalid={!!errors?.payment?.[index]?.paymentMode}
                      invalidText={errors?.payment?.[index]?.paymentMode?.message}
                      initialSelectedItem={paymentModes.find((mode) => mode.uuid === field.value)}
                    />
                  </Layer>
                )}
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
          <br />
          <Button kind="secondary" className={styles.buttonLayout} onClick={closeWorkspace}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" className={styles.button}>
            {t('update', 'Update')}
          </Button>
        </section>
      </section>
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

export default UpdateBillableServicesDialog;
