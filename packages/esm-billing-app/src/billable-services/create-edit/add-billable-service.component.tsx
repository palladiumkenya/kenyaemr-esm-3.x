import React, { useCallback, useState } from 'react';
import styles from './add-billable-service.scss';
import { Form, Button, TextInput, ComboBox, Dropdown, Layer, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { createBillableSerice, usePaymentModes, useServiceTypes } from '../billable-service.resource';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Add, TrashCan } from '@carbon/react/icons';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate, showSnackbar } from '@openmrs/esm-framework';

const servicePriceSchema = z.object({
  paymentMode: z.string().refine((value) => !!value, 'Payment method is required'),
  price: z.union([
    z.number().refine((value) => !!value, 'Price is required'),
    z.string().refine((value) => !!value, 'Price is required'),
  ]),
});
const paymentFormSchema = z.object({ payment: z.array(servicePriceSchema) });

type PaymentMode = {
  paymentMode: string;
  price: string | number;
};
type PaymentModeFormValue = {
  payment: Array<PaymentMode>;
};
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
  } = useForm<PaymentModeFormValue>({
    mode: 'all',
    defaultValues: {},
    resolver: zodResolver(paymentFormSchema),
  });
  const { fields, remove, append } = useFieldArray({ name: 'payment', control: control });

  const handleAppendPaymentMode = useCallback(() => append(DEFAULT_PAYMENT_OPTION), [append]);
  const handleRemovePaymentMode = useCallback((index) => remove(index), [remove]);

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

    createBillableSerice(payload).then(
      (resp) => {
        showSnackbar({
          title: t('billableService', 'Billable service'),
          subtitle: 'Billable service created successfully',
          kind: 'success',
          timeoutInMs: 3000,
        });
        handleNavigateToServiceDashboard();
      },
      (error) => {
        showSnackbar({ title: 'Bill payment error', kind: 'error', subtitle: error });
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
                      onChange={({ selectedItem }) => field.onChange(selectedItem.uuid)}
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
                <TrashCan onClick={handleRemovePaymentMode} className={styles.removeButton} size={20} />
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

export default AddBillableService;
