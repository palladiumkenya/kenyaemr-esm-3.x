import React, { ChangeEvent, useState } from 'react';
import { Form, Stack, FormGroup, Layer, Button, NumberInput } from '@carbon/react';
import { TaskAdd } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './waive-bill-form.scss';
import { LineItem, MappedBill } from '../../../types';
import { createBillWaiverPayload, extractErrorMessagesFromResponse } from '../../../utils';
import { convertToCurrency, extractString } from '../../../helpers';
import { processBillPayment, usePaymentModes } from '../../../billing.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';

type BillWaiverFormProps = {
  bill: MappedBill;
  lineItems: Array<LineItem>;
  setPatientUuid: (patientUuid) => void;
};

export const WaiveBillForm: React.FC<BillWaiverFormProps> = ({ bill, lineItems, setPatientUuid }) => {
  const { t } = useTranslation();
  const [waiverAmount, setWaiverAmount] = useState<string>('0');

  const totalAmount = lineItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const { paymentModes } = usePaymentModes(false);

  if (lineItems?.length === 0) {
    return null;
  }

  const handleProcessPayment = () => {
    const waiverEndPointPayload = createBillWaiverPayload(
      bill,
      parseInt(waiverAmount),
      totalAmount,
      lineItems,
      paymentModes,
    );

    processBillPayment(waiverEndPointPayload, bill.uuid).then(
      (resp) => {
        showSnackbar({
          title: t('billWaiver', 'Bill waiver'),
          subtitle: t('billWaiverSuccess', 'Bill waiver successful'),
          kind: 'success',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
        setPatientUuid('');
        mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/cashier/bill?v=full'), undefined, {
          revalidate: true,
        });
      },
      (error) => {
        showSnackbar({
          title: t('billWaiver', 'Bill waiver'),
          subtitle: t('billWaiverError', 'Bill waiver failed {{error}}', {
            error: extractErrorMessagesFromResponse(error?.responseBody),
          }),
          kind: 'error',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
      },
    );
  };

  return (
    <Form className={styles.billWaiverForm} aria-label={t('waiverForm', 'Waiver form')}>
      <hr />
      <Stack gap={7}>
        <FormGroup legendText={t('waiverForm', 'Waiver form')}>
          <section className={styles.billWaiverDescription}>
            <label className={styles.label}>{t('billItems', 'Bill Items')}</label>
            <p className={styles.value}>
              {t('billName', ' {{billName}} ', {
                billName: lineItems.map((item) => extractString(item.item || item.billableService)).join(', ') ?? '--',
              })}
            </p>
          </section>
          <section className={styles.billWaiverDescription}>
            <label className={styles.label}>{t('billTotal', 'Bill total')}</label>
            <p className={styles.value}>{convertToCurrency(totalAmount)}</p>
          </section>

          <Layer className={styles.formControlLayer}>
            <NumberInput
              id="waiverAmount"
              label={t('amountToWaiveLabel', 'Amount to Waive')}
              helperText={t('amountToWaiveHelper', 'Specify the amount to be deducted from the bill')}
              aria-label={t('amountToWaiveAriaLabel', 'Enter amount to waive')}
              hideSteppers
              disableWheel
              min={0}
              max={totalAmount}
              invalidText={t('invalidWaiverAmountMessage', 'Amount to waive cannot be greater than total amount')}
              value={waiverAmount}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setWaiverAmount(event.target.value)}
            />
          </Layer>
        </FormGroup>
        <div className={styles.buttonContainer}>
          <Button kind="tertiary" renderIcon={TaskAdd} onClick={handleProcessPayment}>
            {t('postWaiver', 'Post waiver')}
          </Button>
        </div>
      </Stack>
    </Form>
  );
};
