import React, { useState } from 'react';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate, showSnackbar } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { LineItem, PaymentFormValue, type MappedBill } from '../../types';
import { convertToCurrency } from '../../helpers';
import { createPaymentPayload } from './utils';
import { processBillPayment } from '../../billing.resource';
import { InvoiceBreakDown } from './invoice-breakdown/invoice-breakdown.component';
import PaymentHistory from './payment-history/payment-history.component';
import PaymentForm from './payment-form/payment-form.component';
import styles from './payments.scss';
import { computeTotalPrice, extractErrorMessagesFromResponse } from '../../utils';
import { mutate } from 'swr';

type PaymentProps = {
  bill: MappedBill;
  selectedLineItems: Array<LineItem>;
};

const Payments: React.FC<PaymentProps> = ({ bill, selectedLineItems }) => {
  const { t } = useTranslation();
  const paymentSchema = z.object({
    method: z.string().refine((value) => !!value, 'Payment method is required'),
    amount: z
      .number()
      .lte(bill.totalAmount - bill.tenderedAmount, { message: 'Amount paid should not be greater than amount due' }),
    referenceCode: z.union([z.number(), z.string()]).optional(),
  });

  const methods = useForm<PaymentFormValue>({
    mode: 'all',
    defaultValues: {},
    resolver: zodResolver(z.object({ payment: z.array(paymentSchema) })),
  });
  const formArrayMethods = useFieldArray({ name: 'payment', control: methods.control });

  const formValues = useWatch({
    name: 'payment',
    control: methods.control,
  });
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  const hasMoreThanOneLineItem = bill?.lineItems?.length > 1;
  const computedTotal = hasMoreThanOneLineItem ? computeTotalPrice(selectedLineItems) : bill.totalAmount ?? 0;
  const totalAmountTendered = formValues?.reduce((curr: number, prev) => curr + Number(prev.amount) ?? 0, 0) ?? 0;
  const amountDue = Number(bill.totalAmount) - (Number(bill.tenderedAmount) + Number(totalAmountTendered));

  const handleNavigateToBillingDashboard = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + 'home/billing',
    });

  const handleProcessPayment = () => {
    const { remove } = formArrayMethods;
    const paymentPayload = createPaymentPayload(bill, bill.patientUuid, formValues, amountDue, selectedLineItems);
    remove();
    processBillPayment(paymentPayload, bill.uuid).then(
      (resp) => {
        showSnackbar({
          title: t('billPayment', 'Bill payment'),
          subtitle: 'Bill payment processing has been successful',
          kind: 'success',
          timeoutInMs: 3000,
        });
        const url = `/ws/rest/v1/cashier/bill/${bill.uuid}`;
        mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
        setPaymentSuccessful(true);
      },
      (error) => {
        showSnackbar({
          title: t('failedBillPayment', 'Bill payment failed'),
          subtitle: `An unexpected error occurred while processing your bill payment. Please contact the system administrator and provide them with the following error details: ${extractErrorMessagesFromResponse(
            error.responseBody,
          )}`,
          kind: 'error',
          timeoutInMs: 3000,
          isLowContrast: true,
        });
      },
    );
  };

  const amountDueDisplay = (amount: number) => (amount < 0 ? 'Client balance' : 'Amount Due');

  return (
    <FormProvider {...methods}>
      <div className={styles.wrapper}>
        <div className={styles.paymentContainer}>
          <CardHeader title={t('payments', 'Payments')}>
            <span></span>
          </CardHeader>
          <div>
            {bill && <PaymentHistory bill={bill} />}
            <PaymentForm {...formArrayMethods} disablePayment={amountDue <= 0} amountDue={amountDue} />
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.paymentTotals}>
          <InvoiceBreakDown label={t('totalAmount', 'Total Amount')} value={convertToCurrency(bill.totalAmount)} />
          <InvoiceBreakDown
            label={t('totalTendered', 'Total Tendered')}
            value={convertToCurrency(bill.tenderedAmount + totalAmountTendered ?? 0)}
          />
          <InvoiceBreakDown label={t('discount', 'Discount')} value={'--'} />
          <InvoiceBreakDown
            hasBalance={amountDue < 0 ?? false}
            label={amountDueDisplay(amountDue)}
            value={convertToCurrency(amountDue ?? 0)}
          />
          <div className={styles.processPayments}>
            <Button onClick={handleNavigateToBillingDashboard} kind="secondary">
              {t('discard', 'Discard')}
            </Button>
            <Button onClick={() => handleProcessPayment()} disabled={!formValues?.length || !methods.formState.isValid}>
              {t('processPayment', 'Process Payment')}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default Payments;
