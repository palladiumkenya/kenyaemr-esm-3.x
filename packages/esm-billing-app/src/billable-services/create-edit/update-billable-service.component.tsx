import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Form,
  ModalHeader,
  Modal,
  TextInput,
  Layer,
  ComboBox,
  InlineLoading,
  Dropdown,
  Search,
  Tile,
  FormLabel,
  ModalBody,
  ModalFooter,
} from '@carbon/react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { showSnackbar, useDebounce, useLayoutType } from '@openmrs/esm-framework';
import styles from './update-billable-services.scss';
import {
  usePaymentModes,
  useServiceTypes,
  useConceptsSearch,
  createBillableService,
} from '../billable-service.resource';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrashCan, Add, WarningFilled } from '@carbon/react/icons';

const servicePriceSchema = z.object({
  paymentMode: z.string().refine((value) => !!value, 'Payment method is required'),
  price: z.union([
    z.number().refine((value) => !!value, 'Price is required'),
    z.string().refine((value) => !!value, 'Price is required'),
  ]),
});
const paymentFormSchema = z.object({ payment: z.array(servicePriceSchema) });

export interface UpdateBillableServicesDialogProps {
  closeModal: () => void;
  service: any;
}

const DEFAULT_PAYMENT_OPTION = { paymentMode: '', price: 0 };

const UpdateBillableServicesDialog: React.FC<UpdateBillableServicesDialogProps> = ({ closeModal, service }) => {
  const { t } = useTranslation();

  const { paymentModes, isLoading: isLoadingPaymentModes } = usePaymentModes();
  const { serviceTypes, isLoading: isLoadingServicesTypes } = useServiceTypes();
  const [open, setOpen] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<any>({
    mode: 'all',
    resolver: zodResolver(paymentFormSchema),
  });

  const { fields, remove, append } = useFieldArray({
    name: 'payment',
    control: control,
  });

  const handleAppendPaymentMode = () => append(DEFAULT_PAYMENT_OPTION);
  const handleRemovePaymentMode = (index) => remove(index);

  const [selectedConcept, setSelectedConcept] = useState(
    service.concept ? { display: service.concept.display, concept: { uuid: service.concept.uuid } } : null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const { searchResults, isSearching } = useConceptsSearch(debouncedSearchTerm);

  const handleConceptChange = useCallback((selectedConcept) => {
    setSelectedConcept(selectedConcept);
  }, []);

  const searchInputRef = useRef(null);
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);

  const isTablet = useLayoutType() === 'tablet';

  useEffect(() => {
    if (!isLoadingPaymentModes && !isLoadingServicesTypes) {
      reset({
        serviceName: service.name,
        shortName: service.shortName,
        payment: service.servicePrices.map((price) => ({
          paymentMode: paymentModes.find((mode) => mode.name === price.name)?.uuid,
          price: price.price,
        })),
        serviceType: serviceTypes.find((type) => type.display === service.serviceType.display),
      });
    }
  }, [isLoadingPaymentModes, isLoadingServicesTypes, paymentModes, serviceTypes, service, reset]);

  const onSubmit = (data) => {
    const updatedService = {
      ...service,
      uuid: service.uuid,
      name: data.serviceName,
      shortName: data.shortName,
      serviceType: data.serviceType?.uuid,
      servicePrices: data.payment.map((payment) => ({
        ...payment,
        name: paymentModes.find((mode) => mode.uuid === payment.paymentMode)?.name,
      })),
      concept: selectedConcept?.concept?.uuid,
    };

    createBillableService(updatedService).then(
      () => {
        showSnackbar({
          title: t('billableService', 'Billable service'),
          subtitle: 'Billable service updated successfully',
          kind: 'success',
          timeoutInMs: 3000,
        });
        closeModal();
      },
      (error) => {
        showSnackbar({ title: 'Update error', kind: 'error', subtitle: error.message });
      },
    );
  };

  if (isLoadingPaymentModes || isLoadingServicesTypes) {
    return (
      <InlineLoading
        status="active"
        iconDescription={t('loadingDescription', 'Loading')}
        description={t('loading', 'Loading data...')}
      />
    );
  }

  return (
    <div>
      <ModalHeader closeModal={closeModal} hasScrollingContent />
      <ModalBody>
        <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <h4>{t('updateBillableService', 'Update Billable Service')}</h4>
          <section className={`${styles.section} ${styles.scrollableContent}`}>
            <section className={styles.section}>
              <Layer>
                <Controller
                  control={control}
                  name="serviceName"
                  defaultValue={service.name || ''}
                  render={({ field }) => (
                    <TextInput
                      id="serviceName"
                      labelText={t('serviceName', 'Service Name')}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      value={field.value}
                      invalid={!!errors.serviceName}
                      invalidText={errors.serviceName?.message}
                    />
                  )}
                />
              </Layer>
              <Layer>
                <Controller
                  control={control}
                  name="shortName"
                  defaultValue={service.shortName || ''}
                  render={({ field }) => (
                    <TextInput
                      id="shortName"
                      labelText={t('shortName', 'Short Name')}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      value={field.value}
                      invalid={!!errors.shortName}
                      invalidText={errors.shortName?.message}
                    />
                  )}
                />
              </Layer>
              <Layer>
                <Controller
                  control={control}
                  name="serviceType"
                  render={({ field }) => (
                    <ComboBox
                      id="serviceType"
                      items={serviceTypes ?? []}
                      titleText={t('serviceType', 'Service Type')}
                      itemToString={(item) => item?.display || ''}
                      onChange={({ selectedItem }) => field.onChange(selectedItem)}
                      placeholder="Select service type"
                      initialSelectedItem={serviceTypes.find((type) => type.display === service.serviceType.display)}
                    />
                  )}
                />
              </Layer>
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
                      value={selectedConcept ? selectedConcept.display : value}
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

              <Button kind="secondary" className={styles.buttonLayout} onClick={closeModal}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" className={styles.button} onClick={onSubmit}>
                {t('update', 'Update')}
              </Button>
            </section>
          </section>
        </Form>
      </ModalBody>
    </div>
  );
};

const ResponsiveWrapper = ({ isTablet, children }) =>
  isTablet ? <Layer className={styles.tabletInputSpacing}>{children}</Layer> : <Layer>{children}</Layer>;

export default UpdateBillableServicesDialog;
