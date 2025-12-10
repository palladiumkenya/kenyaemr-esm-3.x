import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import classNames from 'classnames';
import {
  Dropdown,
  Button,
  ButtonSet,
  InlineLoading,
  InlineNotification,
  NumberInput,
  Stack,
  Column,
} from '@carbon/react';
import {
  type DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  useConfig,
  useLayoutType,
  showSnackbar,
} from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { useBillableItem } from '../../../../billable-services/billable-orders/useBillableItem';
import styles from './create-bill.style.scss';
import { BillingConfig } from '../../../../config-schema';
import { processBillItems } from '../../../../billing.resource';
import { mutate } from 'swr';
import { useCurrencyFormatting } from '../../../../helpers/currency';

type CreateBillWorkspaceProps = DefaultWorkspaceProps & {
  patientUuid: string;
  order: Order;
  closeModal: () => void;
  medicationRequestBundle?: {
    request: fhir.MedicationRequest;
  };
};

const createBillFormSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  unitPrice: z.string().min(1),
  quantity: z.number().min(1),
});

type CreateBillFormSchema = z.infer<typeof createBillFormSchema>;

interface BillFormProps {
  billableItem: any;
  quantityToDispense: number;
  createBillForm: any;
  errors: any;
  calculateTotal: () => number;
  comboBoxItems: Array<{
    id: string;
    text: string;
    unitPrice: number;
  }>;
}

interface MedicationBillFormProps extends Omit<BillFormProps, 'quantityToDispense'> {
  medicationRequestBundle: {
    request: fhir.MedicationRequest;
  };
}

const BillForm: React.FC<BillFormProps> = ({
  billableItem,
  quantityToDispense,
  createBillForm,
  errors,
  calculateTotal,
  comboBoxItems,
}) => {
  const { t } = useTranslation();
  const { format: formatCurrency } = useCurrencyFormatting();

  return (
    <Stack gap={4}>
      <Column>
        <div className={styles.formField}>
          <label className={styles.label}>{t('item', 'Item')}</label>
          <div className={styles.value}>{billableItem?.name ?? 'Service Not Found'}</div>
        </div>
      </Column>
      <Column>
        <Controller
          control={createBillForm.control}
          name="quantity"
          render={({ field }) => (
            <NumberInput
              {...field}
              id="quantity"
              label={t('quantity', 'Quantity')}
              min={1}
              max={quantityToDispense}
              value={field.value}
              onChange={(e, { value }) => field.onChange(value)}
            />
          )}
        />
      </Column>
      <Column>
        <Controller
          control={createBillForm.control}
          name="unitPrice"
          render={({ field }) => (
            <Dropdown
              {...field}
              onChange={({ selectedItem }) => {
                field.onChange(selectedItem?.unitPrice?.toString() ?? '');
                createBillForm.setValue('id', selectedItem?.id ?? '');
                createBillForm.setValue('text', selectedItem?.text ?? '');
              }}
              id="unit-price"
              itemToString={(item) => item?.text ?? ''}
              items={comboBoxItems}
              label={t('selectUnitPrice', 'Select Unit Price')}
              titleText={t('unitPrice', 'Unit Price')}
              type="default"
              invalid={!!errors.unitPrice}
              invalidText={errors.unitPrice?.message}
            />
          )}
        />
      </Column>
      <Column>
        <div className={styles.formField}>
          <label className={styles.label}>{t('total', 'Total')}</label>
          <div className={styles.value}>{formatCurrency(calculateTotal())}</div>
        </div>
      </Column>
    </Stack>
  );
};

const MedicationBillForm: React.FC<MedicationBillFormProps> = ({ medicationRequestBundle, ...props }) => {
  const quantityToDispense = medicationRequestBundle?.request?.dispenseRequest?.quantity?.value ?? 1;
  return <BillForm {...props} quantityToDispense={quantityToDispense} />;
};

const StandardBillForm: React.FC<Omit<BillFormProps, 'quantityToDispense'>> = (props) => {
  return <BillForm {...props} quantityToDispense={1} />;
};

const CreateBillWorkspace: React.FC<CreateBillWorkspaceProps> = ({
  patientUuid,
  order,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  medicationRequestBundle,
}) => {
  const { t } = useTranslation();
  const { format: formatCurrency } = useCurrencyFormatting();
  const defaultPaymentStatus = 'PENDING';
  const isTablet = useLayoutType() === 'tablet';
  const { cashPointUuid, cashierUuid } = useConfig<BillingConfig>();
  const drugUuid = order?.drug?.uuid;
  const { billableItem, isLoading } = useBillableItem(order?.concept?.uuid ?? order?.drug?.concept?.uuid, drugUuid);

  const comboBoxItems =
    billableItem?.servicePrices?.map((item) => ({
      id: item.uuid,
      text: `${item.paymentMode.name} - ${formatCurrency(item.price)}`,
      unitPrice: item.price,
    })) ?? [];

  const createBillForm = useForm<CreateBillFormSchema>({
    defaultValues: {
      id: '',
      text: '',
      unitPrice: '0',
      quantity: medicationRequestBundle?.request?.dispenseRequest?.quantity?.value ?? 1,
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting, errors },
    watch,
  } = createBillForm;

  const calculateTotal = () => {
    const price = parseFloat(watch('unitPrice')) || 0;
    const quantity = watch('quantity') || 1;
    return price * quantity;
  };

  const handleCreateBill = async (formData: CreateBillFormSchema) => {
    const unitPrice = parseFloat(formData.unitPrice);
    const createBillPayload = {
      cashPoint: cashPointUuid,
      cashier: cashierUuid,
      patient: patientUuid,
      status: 'PENDING',
      lineItems: [
        {
          billableService: billableItem?.uuid,
          lineItemOrder: 0,
          quantity: formData.quantity,
          price: unitPrice,
          paymentStatus: defaultPaymentStatus,
          priceUuid: formData.id,
          priceName: formData.text,
          order: order.uuid,
        },
      ],
      payments: [],
    };

    try {
      await processBillItems(createBillPayload);
      showSnackbar({
        title: t('billItems', 'Save Bill'),
        subtitle: 'Bill processing has been successful',
        kind: 'success',
        timeoutInMs: 3000,
      });
      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/bill`), undefined, {
        revalidate: true,
      });
      closeWorkspaceWithSavedChanges();
    } catch (error) {
      console.error('Bill processing error:', error);
      showSnackbar({
        title: 'Bill processing error',
        kind: 'error',
        subtitle: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => true);
    }
  }, [isDirty, promptBeforeClosing]);

  if (isLoading) {
    return <InlineLoading description={t('loadingBillableItems', 'Loading billable items...')} />;
  }

  const commonFormProps = {
    billableItem,
    createBillForm,
    errors,
    calculateTotal,
    comboBoxItems,
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(handleCreateBill, (errors) => console.error('errors', errors))}>
      <div className={styles.formContainer}>
        <ResponsiveWrapper>
          <InlineNotification
            aria-label="closes notification"
            kind="info"
            lowContrast
            statusIconDescription="notification"
            subtitle={t('createBillForOrder', 'Create bill for order {{order}} by selecting the correct unit price', {
              order: order?.concept?.display ?? order?.drug?.display,
            })}
            title={t('orderBillCreation', 'Order Bill Creation {{orderNumber}}', { orderNumber: order.orderNumber })}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          {medicationRequestBundle ? (
            <MedicationBillForm {...commonFormProps} medicationRequestBundle={medicationRequestBundle} />
          ) : (
            <StandardBillForm {...commonFormProps} />
          )}
        </ResponsiveWrapper>
      </div>
      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={!isValid || !isDirty || isSubmitting} kind="primary" type="submit">
          {isSubmitting ? (
            <InlineLoading className={styles.spinner} description={t('creatingBill', 'Creating bill...')} />
          ) : (
            <span>{t('saveAndClose', 'Save & close')}</span>
          )}
        </Button>
      </ButtonSet>
    </form>
  );
};

export default CreateBillWorkspace;
