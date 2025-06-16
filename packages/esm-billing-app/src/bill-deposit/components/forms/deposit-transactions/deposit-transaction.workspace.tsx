import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import { usePatientBills } from '../../../../prompt-payment/prompt-payment.resource';
import { type LineItem, PaymentStatus } from '../../../../types';
import { ButtonSet, Button, InlineLoading, ComboBox, NumberInput, TextInput, InlineNotification } from '@carbon/react';
import { useForm, Controller } from 'react-hook-form';
import styles from './deposit-transaction.workspace.scss';
import classNames from 'classnames';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { convertToCurrency, extractString } from '../../../../helpers';
import uniqBy from 'lodash-es/uniqBy';
import { mutate } from 'swr';
import { BILL_DEPOSIT_TRANSACTION_TYPES } from '../../../constants/bill-deposit.constants';
import { type FormattedDeposit } from '../../../types/bill-deposit.types';
import { addDepositTransaction } from '../../../utils/bill-deposit.utils';

type DepositTransactionWorkspaceProps = DefaultWorkspaceProps & {
  deposit: FormattedDeposit;
  patientUuid: string;
};

const DepositTransactionWorkspace: React.FC<DepositTransactionWorkspaceProps> = ({
  deposit,
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { isLoading, patientBills, error } = usePatientBills(patientUuid);
  const pendingLineItems: Array<LineItem> = uniqBy(
    patientBills
      ?.filter((bill) => bill.status !== PaymentStatus.PAID && bill.status !== PaymentStatus.EXEMPTED)
      .map((bill) => bill.lineItems)
      .flat() ?? [],
    'uuid',
  );

  const transactionTypes = Object.entries(BILL_DEPOSIT_TRANSACTION_TYPES).map(([key, value]) => ({
    key,
    value,
  }));

  const depositTransactionFormSchema = z.object({
    billLineItem: z.string().min(1),
    amount: z
      .number()
      .min(1)
      .max(deposit?.availableBalance ?? 0),
    transactionType: z.string().min(1),
    reason: z.string().min(1),
  });
  type DepositTransactionFormType = z.infer<typeof depositTransactionFormSchema>;

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(depositTransactionFormSchema),
    defaultValues: {
      billLineItem: '',
      amount: 0,
      transactionType: '',
      reason: '',
    },
  });

  const onSubmit = async (data: DepositTransactionFormType) => {
    const payload = {
      billLineItem: data.billLineItem,
      amount: parseFloat(data.amount.toString()),
      transactionType: data.transactionType,
      reason: data.reason,
    };

    try {
      const response = await addDepositTransaction(deposit.id, payload);
      if (response.ok) {
        showSnackbar({
          title: t('transactionAdded', 'Transaction added successfully'),
          kind: 'success',
          subtitle: t('transactionAddedDetails', 'The transaction has been added successfully.'),
          isLowContrast: true,
          timeoutInMs: 5000,
          autoClose: true,
        });
        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/deposit`), undefined, {
          revalidate: true,
        });
      } else {
        showSnackbar({
          title: t('errorAddingTransaction', 'Error adding transaction'),
          kind: 'error',
          subtitle: t('errorAddingTransactionDetails', 'Please try again later. Check the console for more details.'),
          isLowContrast: true,
          timeoutInMs: 5000,
          autoClose: true,
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar({
        title: t('errorSubmittingForm', 'Error submitting form'),
        kind: 'error',
        subtitle: t('errorSubmittingFormDetails', 'Please try again later. Check the console for more details.'),
        isLowContrast: true,
        timeoutInMs: 5000,
        autoClose: true,
      });
    } finally {
      closeWorkspaceWithSavedChanges();
    }
  };
  const handleError = (error: any) => {
    console.error('Error submitting form:', error);
  };

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [isDirty]);

  if (error) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast={true}
        statusIconDescription="notification"
        subtitle={error.message ?? 'An error occurred while fetching the patient bills'}
        title={t('error', 'Error')}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading status="active" iconDescription="Loading" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, handleError)} className={styles.form}>
      <div className={styles.formContainer}>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="billLineItem"
            render={({ field }) => (
              <ComboBox
                id="billLineItem"
                itemToString={(item: LineItem) =>
                  item ? `${extractString(item.billableService)} - ${convertToCurrency(item.price)}` : ''
                }
                items={pendingLineItems ?? []}
                onChange={({ selectedItem }) => field.onChange(selectedItem?.uuid)}
                placeholder={t('selectBillLineItem', 'Select bill line item')}
                invalid={!!errors.billLineItem}
                invalidText={errors.billLineItem?.message}
                titleText={t('billLineItem', 'Bill line item')}
                onToggleClick={() => {}}
              />
            )}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <NumberInput
                id="amount"
                invalid={!!errors.amount}
                invalidText={errors.amount?.message}
                label={t('amount', 'Amount')}
                onChange={({ target }, { value }) => field.onChange(Number(value))}
                max={deposit?.availableBalance}
                min={0}
                size="md"
                hideSteppers
                value={field.value}
              />
            )}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="transactionType"
            render={({ field }) => (
              <ComboBox
                id="transactionType"
                itemToString={(item) => item?.key}
                items={transactionTypes ?? []}
                onChange={({ selectedItem }) => field.onChange(selectedItem.value)}
                placeholder={t('selectTransactionType', 'Select transaction type')}
                invalid={!!errors.transactionType}
                invalidText={errors.transactionType?.message}
                titleText={t('transactionType', 'Transaction type')}
                size="md"
              />
            )}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="reason"
            render={({ field }) => (
              <TextInput
                labelText={t('reason', 'Reason')}
                id="reason"
                invalid={!!errors.reason}
                invalidText={errors.reason?.message}
                onChange={({ target }) => field.onChange(target.value)}
                max={deposit?.availableBalance}
                size="md"
                value={field.value}
              />
            )}
          />
        </ResponsiveWrapper>
      </div>
      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button style={{ maxWidth: '50%' }} kind="secondary" onClick={() => closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={isSubmitting || !isDirty} style={{ maxWidth: '50%' }} kind="primary" type="submit">
          {isSubmitting ? (
            <span style={{ display: 'flex', justifyItems: 'center' }}>
              {t('submitting', 'Submitting...')} <InlineLoading status="active" iconDescription="Loading" />
            </span>
          ) : (
            t('saveAndClose', 'Save & close')
          )}
        </Button>
      </ButtonSet>
    </form>
  );
};

export default DepositTransactionWorkspace;
