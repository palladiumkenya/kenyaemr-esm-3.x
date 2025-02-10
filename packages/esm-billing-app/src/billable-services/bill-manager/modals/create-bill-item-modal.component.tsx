import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Column,
  Dropdown,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBillableServices } from '../../billable-service.resource';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../../../config-schema';
import { billingFormSchema, processBillItems } from '../../../billing.resource';
import styles from './create-bill-item-modal.scss';
import { useStockItemQuantity } from '../../billiable-item/useBillableItem';

interface CreateBillItemModalProps {
  closeModal: () => void;
  medicationRequestBundle: {
    request: fhir.MedicationRequest;
  };
}

type FormType = z.infer<typeof billingFormSchema>;

const CreateBillItemModal: React.FC<CreateBillItemModalProps> = ({ closeModal, medicationRequestBundle }) => {
  const { t } = useTranslation();
  const { billableServices, error, isLoading } = useBillableServices();
  const { cashPointUuid, cashierUuid } = useConfig<BillingConfig>();

  const patientUuid = medicationRequestBundle?.request?.subject?.reference?.split('/')[1];
  const orderUuid = medicationRequestBundle?.request?.id;
  const quantityToDispense = medicationRequestBundle?.request?.dispenseRequest?.quantity?.value;
  const drugUuid = medicationRequestBundle?.request?.medicationReference?.reference?.split('/')[1];
  const { stockItemUuid } = useStockItemQuantity(drugUuid);

  const billableItem =
    billableServices?.filter((service) => {
      const stockItem = service?.stockItem.split(':')[0];
      return stockItem === stockItemUuid;
    }) || [];
  const defaultPaymentStatus = 'PENDING';

  const form = useForm<FormType>({
    mode: 'onChange',
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      cashPoint: cashPointUuid,
      cashier: cashierUuid,
      patient: patientUuid,
      status: 'PENDING',
      lineItems: billableItem.map((service) => ({
        billableService: service.uuid,
        lineItemOrder: 0,
        quantity: quantityToDispense || 1,
        price: 0,
        paymentStatus: defaultPaymentStatus,
        priceUuid: '',
        priceName: '',
        order: orderUuid,
      })),
      payments: [],
    },
  });

  const handleSubmit = async (data: FormType) => {
    const validatedLineItems = data.lineItems.map((item, index) => ({
      ...item,
      billableService: billableItem[index]?.uuid,
      order: orderUuid,
      paymentStatus: defaultPaymentStatus,
    }));

    const validatedData = {
      ...data,
      lineItems: validatedLineItems,
    };

    try {
      await processBillItems(validatedData);
      showSnackbar({
        title: t('billItems', 'Save Bill'),
        subtitle: 'Bill processing has been successful',
        kind: 'success',
        timeoutInMs: 3000,
      });
      // TODO:  mutate the bill
      closeModal();
    } catch (error) {
      console.error('Bill processing error:', error);
      showSnackbar({
        title: 'Bill processing error',
        kind: 'error',
        subtitle: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const calculateTotal = (index: number) => {
    const price = form.watch(`lineItems.${index}.price`) || 0;
    const quantity = form.watch(`lineItems.${index}.quantity`) || 1;
    return price * quantity;
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <ModalHeader closeModal={closeModal} title={t('billing', 'Billing')} />
        <ModalBody>
          <Stack gap={4} className={styles.grid}>
            <Column className={styles.billingItem}>
              <Table aria-label="billing items table">
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
                  {billableItem.map((service, index) => (
                    <TableRow key={service.uuid}>
                      <TableCell>{service?.name || 'Service Not Found'}</TableCell>
                      <TableCell>
                        <Controller
                          control={form.control}
                          name={`lineItems.${index}.quantity`}
                          defaultValue={quantityToDispense}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              className="form-control"
                              min={1}
                              max={quantityToDispense}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                field.onChange(value);
                              }}
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
                              id={`priceUuid-${index}`}
                              invalid={!!form.formState.errors.lineItems?.[index]?.priceUuid}
                              invalidText={form.formState.errors.lineItems?.[index]?.priceUuid?.message}
                              onChange={(e) => {
                                const selectedPrice = service?.servicePrices.find((p) => p.uuid === e.selectedItem);
                                if (selectedPrice) {
                                  field.onChange(e.selectedItem);
                                  form.setValue(`lineItems.${index}.price`, selectedPrice.price);
                                  form.setValue(`lineItems.${index}.priceName`, selectedPrice.name);
                                  form.setValue(`lineItems.${index}.billableService`, service.uuid);
                                  form.setValue(`lineItems.${index}.order`, orderUuid);
                                  form.setValue(`lineItems.${index}.paymentStatus`, defaultPaymentStatus);
                                }
                              }}
                              selectedItem={field.value}
                              label="Choose method"
                              items={service?.servicePrices.map((r) => r.uuid) ?? []}
                              itemToString={(item) => service?.servicePrices.find((r) => r.uuid === item)?.name ?? ''}
                              direction="top"
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>{form.watch(`lineItems.${index}.price`) ?? ' '}</TableCell>
                      <TableCell>{calculateTotal(index)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Column>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button className={styles.button} kind="secondary" onClick={closeModal}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
            {t('saveAndClose', 'Save & Close')}
          </Button>
        </ModalFooter>
      </form>
    </div>
  );
};

export default CreateBillItemModal;
