import React, { useEffect } from 'react';
import { Dropdown, Button, ButtonSet, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { useBillableItem } from '../../../billiable-item/useBillableItem';
import styles from './create-bill.style.scss';
import { Controller, useForm } from 'react-hook-form';
import {
  type DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { convertToCurrency } from '../../../../helpers';
import { BillingConfig } from '../../../../config-schema';
import { z } from 'zod';
import { processBillItems } from '../../../../billing.resource';
import { mutate } from 'swr';

type CreateBillWorkspaceProps = DefaultWorkspaceProps & {
  patientUuid: string;
  order: Order;
};

const createBillFormSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  unitPrice: z.string().min(1),
});

type CreateBillFormSchema = z.infer<typeof createBillFormSchema>;

const CreateBillWorkspace: React.FC<CreateBillWorkspaceProps> = ({
  patientUuid,
  order,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const defaultPaymentStatus = 'PENDING';
  const isTablet = useLayoutType() === 'tablet';
  const { cashPointUuid, cashierUuid } = useConfig<BillingConfig>();
  const { billableItem, isLoading } = useBillableItem(order.concept.uuid);

  const comboBoxItems =
    billableItem?.servicePrices?.map((item) => ({
      id: item.uuid,
      text: `${item.paymentMode.name} - ${convertToCurrency(item.price)}`,
      unitPrice: item.price,
    })) ?? [];

  const createBillForm = useForm<CreateBillFormSchema>({
    defaultValues: {
      id: '',
      text: '',
      unitPrice: '0',
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting, errors },
  } = createBillForm;

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
          quantity: 1,
          price: unitPrice,
          paymentStatus: defaultPaymentStatus,
          priceUuid: '',
          priceName: formData.text,
          order: order.uuid,
        },
      ],
      payments: [],
    };
    await processBillItems(createBillPayload);
    mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/bill`), undefined, {
      revalidate: true,
    });
    closeWorkspaceWithSavedChanges();
  };

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => true);
    }
  }, [isDirty, promptBeforeClosing]);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(handleCreateBill)}>
      <div className={styles.formContainer}>
        <ResponsiveWrapper>
          <InlineNotification
            aria-label="closes notification"
            kind="info"
            lowContrast
            statusIconDescription="notification"
            subtitle={t('createBillForOrder', 'Create bill for order {{order}} by selecting the correct unit price', {
              order: order.concept.display,
            })}
            title={t('orderBillCreation', 'Order Bill Creation {{orderNumber}}', { orderNumber: order.orderNumber })}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          <Controller
            control={createBillForm.control}
            name="unitPrice"
            render={({ field }) => (
              <Dropdown
                {...field}
                onChange={({ selectedItem }) => {
                  field.onChange(selectedItem?.unitPrice?.toString() || '');
                  createBillForm.setValue('id', selectedItem?.id || '');
                  createBillForm.setValue('text', selectedItem?.text || '');
                }}
                id="unit-price"
                itemToString={(item) => item?.text || ''}
                items={comboBoxItems}
                label={t('selectUnitPrice', 'Select Unit Price')}
                titleText={t('unitPrice', 'Unit Price')}
                type="default"
                invalid={!!errors.unitPrice}
                invalidText={errors.unitPrice?.message}
              />
            )}
          />
        </ResponsiveWrapper>
      </div>
      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
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
    </Form>
  );
};

export default CreateBillWorkspace;
