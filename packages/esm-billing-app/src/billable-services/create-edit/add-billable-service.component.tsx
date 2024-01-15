import React, { useCallback, useEffect, useState } from 'react';
import styles from './add-billable-service.scss';
import { Form, ModalHeader, ModalBody, ModalFooter, Button, TextInput, ComboBox, Dropdown } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { createBillableSerice, usePaymentModes, useServiceTypes } from '../billable-service.resource';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Add, TrashCan } from '@carbon/react/icons';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate, showSnackbar, useLayoutType } from '@openmrs/esm-framework';

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
  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();

  const { paymentModes } = usePaymentModes();
  const { serviceTypes } = useServiceTypes();

  const [paymentOptions, setPaymentOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
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

  useEffect(() => {
    let options = [];

    if (paymentModes) {
      paymentModes.forEach((e) => {
        options.push({ uuid: e.uuid, name: e.name });
      });
    }
    setPaymentOptions(options);
  }, [paymentModes]);

  useEffect(() => {
    let options = [];

    if (serviceTypes) {
      serviceTypes.forEach((e) => {
        options.push({ id: e.uuid, text: e.display });
      });
    }
    setServiceOptions(options);
  }, [serviceTypes]);

  const onSubmit = (data) => {
    const payload: any = {};

    let servicePrices = [];
    data.payment.forEach((element) => {
      element.name = paymentOptions.filter((p) => p.uuid === element.paymentMode)[0].name;
      servicePrices.push(element);
    });
    payload.name = billableServicePayload.serviceName;
    payload.shortName = billableServicePayload.shortName;
    payload.serviceType = billableServicePayload.serviceType.id;
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
      <ModalHeader>
        <p>Add Billable Services</p>
      </ModalHeader>
      <ModalBody>
        <section className={styles.section}>
          <TextInput
            id="serviceName"
            type="text"
            light={isTablet}
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
        </section>
        <section className={styles.section}>
          <TextInput
            id="serviceShortName"
            type="text"
            light={isTablet}
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
        </section>

        <section className={styles.section}>
          <ComboBox
            id="serviceType"
            light={isTablet}
            items={serviceOptions}
            titleText={t('serviceType', 'Service Type')}
            itemToString={(item) => item?.text}
            onChange={({ selectedItem }) => {
              setBillableServicePayload({
                ...billableServicePayload,
                display: selectedItem?.text,
                serviceType: selectedItem,
              });
            }}
            placeholder="Select service type"
            required
          />
        </section>

        <section>
          <div className={styles.container}>
            {fields.map((field, index) => (
              <div key={field.id} className={styles.paymentMethodContainer}>
                <Controller
                  control={control}
                  name={`payment.${index}.paymentMode`}
                  render={({ field }) => (
                    <Dropdown
                      onChange={({ selectedItem }) => field.onChange(selectedItem.uuid)}
                      titleText={t('paymentMode', 'Payment Mode')}
                      label={t('selectPaymentMethod', 'Select payment method')}
                      items={paymentOptions}
                      itemToString={(item) => (item ? item.name : '')}
                      invalid={!!errors?.payment?.[index]?.paymentMode}
                      invalidText={errors?.payment?.[index]?.paymentMode?.message}
                      light={isTablet}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`payment.${index}.price`}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      invalid={!!errors?.payment?.[index]?.price}
                      invalidText={errors?.payment?.[index]?.price?.message}
                      labelText={t('sellingPrice', 'Selling Price')}
                      placeholder={t('sellingAmount', 'Enter selling price')}
                      light={isTablet}
                    />
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
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={{}}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={handleSubmit(onSubmit)}>
          {t('save', 'Save')}
        </Button>
      </ModalFooter>
    </Form>
  );
};

export default AddBillableService;
