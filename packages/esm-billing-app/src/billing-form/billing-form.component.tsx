import React, { useState } from 'react';
import { mutate } from 'swr';
import { getPatientUuidFromStore } from '@openmrs/esm-patient-common-lib';
import { type DefaultWorkspaceProps, showSnackbar, useConfig } from '@openmrs/esm-framework';
import {
  Button,
  ButtonSet,
  Column,
  Dropdown,
  Form,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Autosuggest } from '../autosuggest/autosuggest.component';
import useBillableServices from '../hooks/useBillableServices';
import { billingFormSchema, processBillItems } from '../billing.resource';
import { type BillingService } from '../types';
import { type BillingConfig } from '../config-schema';

import styles from './billing-form.scss';

type BillingFormProps = DefaultWorkspaceProps & {
  patientUuid: string;
};

type FormType = z.infer<typeof billingFormSchema>;

const BillingForm: React.FC<BillingFormProps> = ({ closeWorkspace, patientUuid: patientUuidProp }) => {
  const { t } = useTranslation();
  const patientUuid = patientUuidProp || getPatientUuidFromStore();
  const { billableServices, error, isLoading } = useBillableServices();
  const [searchTermValue, setSearchTermValue] = useState('');
  const { cashPointUuid, cashierUuid } = useConfig<BillingConfig>();

  const form = useForm<FormType>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      cashPoint: cashPointUuid,
      cashier: cashierUuid,
      patient: patientUuid,
      status: 'PENDING',
      lineItems: [],
      payments: [],
    },
  });

  const onSubmit = async (values: FormType) => {
    try {
      await processBillItems(values);
      mutate((key) => typeof key === 'string' && key.startsWith(`/ws/rest/v1/cashier/bill`), undefined, {
        revalidate: true,
      });
      showSnackbar({
        title: t('billItems', 'Save Bill'),
        subtitle: 'Bill processing has been successful',
        kind: 'success',
        timeoutInMs: 3000,
      });
      closeWorkspace();
    } catch (e) {
      showSnackbar({ title: 'Bill processing error', kind: 'error', subtitle: e });
    }
  };

  const handleSearch = async (searchText: string) => {
    setSearchTermValue(searchText);
    return billableServices.filter(
      (service) =>
        service?.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) &&
        lineItemsToWatch.findIndex((item) => item.billableService === service?.uuid) === -1,
    );
  };

  const lineItemsToWatch = form.watch('lineItems');

  const handleSuggestionSelected = (field: string, value: string) => {
    if (value) {
      form.setValue('lineItems', [
        ...lineItemsToWatch,
        {
          billableService: value,
          lineItemOrder: 0,
          quantity: 1,
          price: 0,
          paymentStatus: 'PENDING',
          priceName: 'Default',
        },
      ]);
    }
    setSearchTermValue('');
  };

  const handleError = (errors: any) => {
    console.error('errors', errors);
    showSnackbar({ title: t('error', 'Error'), kind: 'error', subtitle: JSON.stringify(errors) });
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit, handleError)}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Autosuggest
            value={searchTermValue}
            onClear={() => setSearchTermValue('')}
            getDisplayValue={(item: BillingService) => item.name}
            getFieldValue={(item: BillingService) => item.uuid}
            getSearchResults={handleSearch}
            onSuggestionSelected={handleSuggestionSelected}
            labelText={t('search', 'Search')}
            placeholder={t('searchPlaceHolder', 'Find your billables here...')}
          />
        </Column>
        <Column className={styles.billingItem}>
          <Table aria-label="sample table">
            <TableHead>
              <TableRow>
                <TableHeader>{t('item', 'Item')}</TableHeader>
                <TableHeader>{t('quantity', 'Quantity')}</TableHeader>
                <TableHeader>{t('paymentMethod', 'Payment Method')}</TableHeader>
                <TableHeader>{t('price', 'Price')}</TableHeader>
                <TableHeader>{t('total', 'Total')}</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {lineItemsToWatch.map(({ billableService, quantity, price }, index) => {
                const service = billableServices.find((serv) => serv.uuid === billableService);
                return (
                  <TableRow key={billableService}>
                    <TableCell>{service?.name}</TableCell>
                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`lineItems.${index}.quantity` as any}
                        render={({ field }) => (
                          <input
                            ref={field.ref}
                            value={field.value}
                            onChange={({ target: { value } }) => {
                              field.onChange(value);
                            }}
                            type="number"
                            className="form-control"
                            id={billableService}
                            min={1}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`lineItems.${index}.priceUuid`}
                        render={({ field }) => (
                          <Dropdown
                            hideLabel
                            ref={field.ref}
                            invalid={form.formState.errors[field.name]?.message}
                            invalidText={form.formState.errors[field.name]?.message}
                            id="priceUuid"
                            onChange={(e) => {
                              field.onChange(e.selectedItem);
                              const price = service?.servicePrices.find((p) => p.uuid === e.selectedItem)?.price;
                              form.setValue(`lineItems.${index}.price`, price ?? 0);
                            }}
                            selectedItem={field.value}
                            label={t('choosePrice', 'Choose price')}
                            titleText={t('choosePrice', 'Choose price')}
                            items={service?.servicePrices.map((r) => r.uuid) ?? []}
                            itemToString={(item) => service?.servicePrices.find((r) => r.uuid === item)?.name ?? ''}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell id={service?.name + 'Price'}>{price}</TableCell>
                    <TableCell id={service?.name + 'Total'}>{price * quantity}</TableCell>
                    <TableCell id={service?.name + 'Delete'}>
                      <Button
                        renderIcon={TrashCan}
                        iconDescription={t('delete', 'Delete')}
                        kind="danger"
                        hasIconOnly
                        onClick={() => {
                          form.setValue(
                            'lineItems',
                            lineItemsToWatch.filter((item) => item.billableService !== billableService),
                          );
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>

                <TableCell style={{ fontWeight: 'bold' }}>{t('grandTotal', 'Grand Total')}:</TableCell>
                <TableCell id="GrandTotalSum">
                  {lineItemsToWatch.reduce((prev, curr) => {
                    const total = curr.quantity * curr.price;
                    return prev + total;
                  }, 0)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
          {t('saveAndClose', 'Save & Close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default BillingForm;
