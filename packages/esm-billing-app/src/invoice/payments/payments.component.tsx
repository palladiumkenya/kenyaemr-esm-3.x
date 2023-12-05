import React from 'react';
import { Button, Dropdown, TextInput } from '@carbon/react';
import { Add, TrashCan } from '@carbon/react/icons';
import styles from './payments.scss';
import { useTranslation } from 'react-i18next';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { convertToCurrency } from '../../helpers';
import { InvoiceBreakDown } from './invoice-breakdown.component';
import { MappedBill } from '../../types';
import { navigate, showSnackbar } from '@openmrs/esm-framework';
import { processPayments } from './utils';
import PaymentHistory from './payment-history.component';
import { makeBillPayment } from '../../billing.resource';

type PaymentProps = { bill: MappedBill };
export type Payment = { method: string; amount: number; referenceCode?: number | string };
export type PaymentFormValue = {
  payment: Array<Payment>;
};

const Payments: React.FC<PaymentProps> = ({ bill }) => {
  const { t } = useTranslation();
  const { register, control, handleSubmit, formState } = useForm<PaymentFormValue>();
  const { fields, append, remove } = useFieldArray({ name: 'payment', control });

  const formValues = useWatch({
    name: 'payment',
    control,
  });

  const totalAmountTendered = formValues?.reduce((curr, prev) => curr + prev.amount ?? 0, 0) ?? 0;
  const amountDue = bill.totalAmount - (bill.tenderedAmount + totalAmountTendered);

  const handleProcessPayment = async () => {
    const payload = processPayments(bill, bill.patientUuid, formValues);

    const paymentStatus = bill.totalAmount - totalAmountTendered > 0 ? 'PENDING' : 'PAID';
    payload.status = paymentStatus;
    const response = await makeBillPayment(payload, bill.uuid);
    if (response.ok) {
      showSnackbar({
        kind: 'sucess',
        subtitle: t('billProcessedSuccesfully', 'Bill processed successfully'),
        title: 'Bill payment',
      });
    }
    if (!response.ok) {
      showSnackbar({
        kind: 'error',
        subtitle: t('unableToProcessBill', response.statusText),
        title: 'Bill payment error',
      });
    }
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.paymentContainer}>
          <CardHeader title={t('payments', 'Payments')}>
            <span></span>
          </CardHeader>
          <div>
            <PaymentHistory bill={bill} />
            {fields.map((field, index) => (
              <div key={field.id} className={styles.paymentMethodContainer}>
                <Controller
                  control={control}
                  name={`payment.${index}.method`}
                  render={({ field: { onChange } }) => (
                    <Dropdown
                      light
                      onChange={({ selectedItem }) => onChange(selectedItem.id)}
                      titleText={t('paymentMethod', 'Payment method')}
                      label={t('selectPaymentMethod', 'Select payment method')}
                      items={[
                        { id: 'mpesa', text: 'MPESA' },
                        { id: 'cash', text: 'Cash' },
                        { id: 'bankDeposit', text: 'Bank Deposit' },
                      ]}
                      itemToString={(item) => (item ? item.text : '')}
                    />
                  )}
                />

                <TextInput
                  light
                  {...register(`payment.${index}.amount`, { required: true })}
                  type="number"
                  labelText={t('amount', 'Amount')}
                />

                {formValues && formValues[index]?.method !== '' && formValues[index]?.method !== 'cash' && (
                  <TextInput
                    light
                    {...register(`payment.${index}.referenceCode`, { required: true })}
                    type="text"
                    labelText={t('referenceNumber', 'Reference number')}
                  />
                )}

                <Button
                  onClick={() => remove(index)}
                  size="sm"
                  renderIcon={(props) => <TrashCan size={24} {...props} />}
                  kind="danger--tertiary"
                  iconDescription="TrashCan">
                  {t('delete', 'Delete')}
                </Button>
              </div>
            ))}
          </div>
          <Button
            size="md"
            onClick={() => append({ method: '', amount: 0, referenceCode: '' })}
            className={styles.paymentButtons}
            renderIcon={(props) => <Add size={24} {...props} />}
            iconDescription="Add">
            {t('addPaymentOptions', 'Add payment option')}
          </Button>
        </div>
        <div className={styles.paymentTotals}>
          <InvoiceBreakDown label={t('totalAmount', 'Total Amount')} value={convertToCurrency(bill.totalAmount)} />
          <InvoiceBreakDown
            label={t('totalTendered', 'Total Tendered')}
            value={convertToCurrency(bill.tenderedAmount + totalAmountTendered ?? 0)}
          />
          <InvoiceBreakDown label={t('discount', 'Discount')} value={'--'} />
          <InvoiceBreakDown label={t('amountDue', 'Amount due')} value={convertToCurrency(amountDue ?? 0)} />
        </div>
      </div>
      <div className={styles.processPayments}>
        <Button
          onClick={() =>
            navigate({
              to: window.getOpenmrsSpaBase() + 'home/billing',
            })
          }
          kind="danger">
          {t('discardPayment', 'Discard Payment')}
        </Button>
        <Button onClick={handleProcessPayment} disabled={!formValues?.length}>
          {t('processPayment', 'Process Payment')}
        </Button>
      </div>
    </>
  );
};

export default Payments;
