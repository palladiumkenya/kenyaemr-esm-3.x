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
import { zodResolver } from '@hookform/resolvers/zod';
import { getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Autosuggest } from '../autosuggest/autosuggest.component';
import { billingFormSchema, processBillItems } from '../billing.resource';
import useBillableServices from '../hooks/useBillableServices';
import { BillingService } from '../types';
import styles from './billing-form.scss';
import { mutate } from 'swr';
import { showSnackbar } from '@openmrs/esm-framework';

type BillingFormProps = {
  patientUuid: string;
  closeWorkspace: () => void;
};

type FormType = z.infer<typeof billingFormSchema>;

const BillingForm: React.FC<BillingFormProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  const { billableServices, error, isLoading } = useBillableServices();
  const [BillItems, setBillItems] = useState([]);
  const [searchVal, setsearchVal] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      cashPoint: '54065383-b4d4-42d2-af4d-d250a1fd2590',
      cashier: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
      patient: patientUuid,
      status: 'PENDING',
      lineItems: [],
      payments: [],
    },
  });

  const onSubmit = async (values: FormType) => {
    try {
      await processBillItems(values);
      closeWorkspace();
      mutate((key) => typeof key === 'string' && key.startsWith(`/ws/rest/v1/cashier/bill`), undefined, {
        revalidate: true,
      });
      showSnackbar({
        title: t('billItems', 'Save Bill'),
        subtitle: 'Bill processing has been successful',
        kind: 'success',
        timeoutInMs: 3000,
      });
    } catch (e) {
      showSnackbar({ title: 'Bill processing error', kind: 'error', subtitle: e });
    }
  };

  const handleSearch = async (searchText: string) => {
    setsearchVal(searchText);
    return billableServices.filter((searvice) =>
      searvice.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    );
  };

  const lineItemsOnservable = form.watch('lineItems');

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Autosuggest
            value={searchVal}
            onClear={() => setsearchVal('')}
            getDisplayValue={(item: BillingService) => item.name}
            getFieldValue={(item: BillingService) => item.uuid}
            getSearchResults={handleSearch}
            onSuggestionSelected={(field, value) => {
              if (value) {
                form.setValue('lineItems', [
                  ...lineItemsOnservable,
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
              setsearchVal('');
            }}
            labelText={t('search', 'Search')}
            placeholder={t('searchPlaceHolder', 'Find your billables here...')}
          />
        </Column>
        <Column className={styles.billingItem}>
          <Table aria-label="sample table">
            <TableHead>
              <TableRow>
                <TableHeader>Item</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader>PaymentMethod</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Total</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {lineItemsOnservable.map(({ billableService, quantity, price }, index) => {
                const service = billableServices.find((serv) => serv.uuid === billableService);
                return (
                  <TableRow>
                    <TableCell>{service.name}</TableCell>
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
                            min={0}
                            max={100}
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
                            ref={field.ref}
                            invalid={form.formState.errors[field.name]?.message}
                            invalidText={form.formState.errors[field.name]?.message}
                            id="priceUuid"
                            onChange={(e) => {
                              field.onChange(e.selectedItem);
                              const price = service.servicePrices.find((p) => p.uuid === e.selectedItem)?.price;
                              form.setValue(`lineItems.${index}.price`, price ?? 0);
                            }}
                            initialSelectedItem={field.value}
                            label="Choose price"
                            items={service.servicePrices.map((r) => r.uuid)}
                            itemToString={(item) => service.servicePrices.find((r) => r.uuid === item)?.name ?? ''}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell id={service.name + 'Price'}>{price}</TableCell>
                    <TableCell id={service.name + 'Total'} className="totalValue">
                      {price * quantity}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>

                <TableCell style={{ fontWeight: 'bold' }}>Grand Total:</TableCell>
                <TableCell id="GrandTotalSum">
                  {lineItemsOnservable.reduce((prev, curr) => {
                    const totoal = curr.quantity * curr.price;
                    return prev + totoal;
                  }, 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
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
