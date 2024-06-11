import React, { useCallback, useRef, useState } from 'react';
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
  paymentMode: z.string().refine((value) => !!value, 'Payment method is required'),
  price: z.union([
    z.number().refine((value) => !!value, 'Price is required'),
    z.string().refine((value) => !!value, 'Price is required'),
  ]),
});
const paymentFormSchema = z.object({ payment: z.array(servicePriceSchema) });
const DEFAULT_PAYMENT_OPTION = { paymentMode: '', price: 0 };

const AddBillableService: React.FC = () => {
  const { t } = useTranslation();

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();
  const { serviceTypes, isLoading: isLoadingServicesTypes } = useServiceTypes();
  const [billableServicePayload, setBillableServicePayload] = useState<any>({});

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    mode: 'all',
    defaultValues: {},
    resolver: zodResolver(paymentFormSchema),
  });
  const { fields, remove, append } = useFieldArray({ name: 'payment', control: control });

  const handleAppendPaymentMode = useCallback(() => append(DEFAULT_PAYMENT_OPTION), [append]);
  const handleRemovePaymentMode = useCallback((index) => remove(index), [remove]);

  const isTablet = useLayoutType() === 'tablet';
  const searchInputRef = useRef(null);
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);

  const [selectedConcept, setSelectedConcept] = useState<ServiceConcept>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const { searchResults, isSearching } = useConceptsSearch(debouncedSearchTerm);
  const handleConceptChange = useCallback((selectedConcept: any) => {
    setSelectedConcept(selectedConcept);
  }, []);

  const handleNavigateToServiceDashboard = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + 'billable-services',
    });

  if (isLoadingPaymentModes && isLoadingServicesTypes) {
    return (
      <InlineLoading
        status="active"
        iconDescription={t('loadingDescription', 'Loading')}
        description={t('loading', 'Loading data...')}
      />
    );
  }

  const onSubmit = (data) => {
    const payload: any = {};

    let servicePrices = [];
    data.payment.forEach((element) => {
      element.name = paymentModes.filter((p) => p.uuid === element.paymentMode)[0].name;
      servicePrices.push(element);
    });
    payload.name = billableServicePayload.serviceName;
    payload.shortName = billableServicePayload.shortName;
    payload.serviceType = billableServicePayload.serviceType.uuid;
    payload.servicePrices = servicePrices;
    payload.serviceStatus = 'ENABLED';
    payload.concept = selectedConcept?.concept?.uuid;

    createBillableService(payload).then(
      (resp) => {
        showSnackbar({
          title: t('billableService', 'Billable service'),
          subtitle: 'Billable service created successfully',
          kind: 'success',
          isLowContrast: true,
          timeoutInMs: 3000,
        });
        handleNavigateToServiceDashboard();
      },
      (error) => {
        showSnackbar({
          title: 'Error adding billable service',
          kind: 'error',
          subtitle: extractErrorMessagesFromResponse(error.responseBody),
          isLowContrast: true,
        });
      },
    );
  };

  return (
    <Form className={styles.form}>
      <h4>{t('addBillableServices', 'Add Billable Services')}</h4>
      <section className={styles.section}>
        <Layer>
          <TextInput
            id="serviceName"
            type="text"
            labelText={t('serviceName', 'Service Name')}
            size="md"
            onChange={(e) =>
              setBillableServicePayload({
                ...billableServicePayload,
                serviceName: e.target.value,
              })
            }
            placeholder="Enter service name"
          />
        </Layer>
      </section>
      <section className={styles.section}>
        <Layer>
          <TextInput
            id="serviceShortName"
            type="text"
            labelText={t('serviceShortName', 'Short Name')}
            size="md"
            onChange={(e) =>
              setBillableServicePayload({
                ...billableServicePayload,
                shortName: e.target.value,
              })
            }
            placeholder="Enter service short name"
          />
        </Layer>
      </section>
      <section>
        <FormLabel className={styles.conceptLabel}>Associated Concept</FormLabel>
        <Controller
          name="search"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <ResponsiveWrapper isTablet={isTablet}>
              <Search
                ref={searchInputRef}
                size="md"
                id="conceptsSearch"
                labelText={t('enterConcept', 'Associated concept')}
                placeholder={t('searchConcepts', 'Search associated concept')}
                className={errors?.search && styles.serviceError}
                onChange={(e) => {
                  onChange(e);
                  handleSearchTermChange(e);
                }}
                renderIcon={errors?.search && <WarningFilled />}
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
                {/*TODO: use uuid instead of index as the key*/}
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
      </section>
      <section className={styles.section}>
        <Layer>
          <ComboBox
            id="serviceType"
            items={serviceTypes ?? []}
            titleText={t('serviceType', 'Service Type')}
            itemToString={(item) => item?.display}
            onChange={({ selectedItem }) => {
              setBillableServicePayload({
                ...billableServicePayload,
                display: selectedItem?.display,
                serviceType: selectedItem,
              });
            }}
            placeholder="Select service type"
            required
          />
        </Layer>
      </section>

      <section>
        <div className={styles.container}>
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
        </div>
      </section>

      <section>
        <Button kind="secondary" onClick={handleNavigateToServiceDashboard}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={handleSubmit(onSubmit)}>
          {t('save', 'Save')}
        </Button>
      </section>
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

export default AddBillableService;
