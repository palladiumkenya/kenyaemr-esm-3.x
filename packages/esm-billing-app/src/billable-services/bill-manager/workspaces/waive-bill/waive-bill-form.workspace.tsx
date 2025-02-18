import React, { useEffect } from 'react';
import {
  FormGroup,
  Layer,
  Button,
  NumberInput,
  TextArea,
  InlineNotification,
  InlineLoading,
  ButtonSet,
} from '@carbon/react';
import { TaskAdd } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './waive-bill-form.scss';
import { MappedBill } from '../../../../types';
import { createBillWaiverPayload, extractErrorMessagesFromResponse } from '../../../../utils';
import { convertToCurrency, extractString } from '../../../../helpers';
import { processBillPayment, usePaymentModes } from '../../../../billing.resource';
import { restBaseUrl, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import first from 'lodash-es/first';
import classNames from 'classnames';

type BillWaiverFormProps = DefaultPatientWorkspaceProps & {
  bill: MappedBill;
};

export const WaiveBillForm: React.FC<BillWaiverFormProps> = ({
  bill,
  closeWorkspace,
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
}) => {
  const { lineItems = [], payments = [] } = bill ?? {};
  const isTablet = useLayoutType() === 'tablet';

  const { t } = useTranslation();

  const totalAmount = lineItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const { isLoading, paymentModes = [] } = usePaymentModes(false);
  const waiverPaymentMode =
    first(paymentModes.filter((mode) => mode.name.toLowerCase().includes('waiver')))?.attributeTypes ?? [];
  // calculate amount already waived or paid this is to ensure that the amount to waive is not greater than the total amount
  const amountAlreadyWaivedOrPaid = payments.reduce((acc, curr) => acc + curr.amountTendered, 0);

  const schema = z.object({
    waiveAmount: z
      .string({ required_error: t('waiveAmountRequired', 'Waive amount is required') })
      .refine((n) => parseInt(n) > 0, {
        message: t('waiveAmountGreaterThanZero', 'Amount to waive should be greater than zero'),
      })
      .refine(
        (n) =>
          amountAlreadyWaivedOrPaid > 0
            ? parseInt(n) < totalAmount - amountAlreadyWaivedOrPaid + 1
            : parseInt(n) < totalAmount + 1,
        {
          message:
            amountAlreadyWaivedOrPaid > 0
              ? t(
                  'waiveAmountCannotBeGreaterThanRemainingAmount',
                  'Amount to waive cannot be greater than the remaining amount {{remainingAmount}}',
                  {
                    remainingAmount: totalAmount - amountAlreadyWaivedOrPaid,
                  },
                )
              : t('waiveAmountCannotBeGreaterThanTotal', 'Amount to waive cannot be greater than total amount'),
        },
      ),
    waiverReason: z
      .string({ required_error: t('waiverReasonRequired', 'Waiver reason is required') })
      .min(1, { message: t('waiverReasonRequired', 'Waiver reason is required') }),
  });

  type FormData = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, isValid },
  } = useForm<FormData>({
    mode: 'all',
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  if (lineItems?.length === 0) {
    return null;
  }

  const onSubmit: SubmitHandler<FormData> = ({ waiveAmount, waiverReason }) => {
    const waiverEndPointPayload = createBillWaiverPayload(
      bill,
      parseInt(waiveAmount),
      totalAmount,
      lineItems,
      paymentModes,
      waiverReason,
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
        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/bill?status`), undefined, {
          revalidate: true,
        });
        closeWorkspaceWithSavedChanges();
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

  if (isLoading) {
    return <InlineLoading description={t('loading', 'Loading')} />;
  }

  if (waiverPaymentMode.length === 0) {
    return (
      <div className={styles.waiverPaymentModeNotFound}>
        <InlineNotification
          title={t('waiverPaymentModeNotFound', 'Waiver payment mode not found')}
          subtitle={t(
            'waiverPaymentModeNotFoundSubtitle',
            'Contact your administrator to create a waiver payment attribute type to waive a bill',
          )}
          kind="error"
          lowContrast
        />
      </div>
    );
  }

  return (
    <form className={styles.form} aria-label={t('waiverForm', 'Waiver form')} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formContainer}>
        <FormGroup legendText={t('billItemsSummary', 'Bill Items Summary')}>
          <section className={styles.billWaiverDescription}>
            <label className={styles.label}>{t('waiverBillItems', 'Bill Items')}</label>
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
          {amountAlreadyWaivedOrPaid > 0 && (
            <section className={styles.billWaiverDescription}>
              <label className={styles.label}>{t('amountAlreadyWaivedOrPaid', 'Total paid / waived')}</label>
              <p className={styles.value}>{convertToCurrency(amountAlreadyWaivedOrPaid)}</p>
            </section>
          )}
          <Controller
            control={control}
            name="waiveAmount"
            render={({ field }) => (
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
                  {...field}
                  invalidText={errors.waiveAmount?.message || 'Invalid'}
                  invalid={!!errors.waiveAmount}
                />
              </Layer>
            )}
          />
          <Controller
            control={control}
            name="waiverReason"
            render={({ field }) => (
              <TextArea labelText={t('waiverReasonLabel', 'Waiver reason')} rows={4} id="waiverReason" {...field} />
            )}
          />
        </FormGroup>
      </div>
      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button style={{ maxWidth: '50%' }} kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={isSubmitting || !isDirty || !isValid}
          style={{ maxWidth: '50%' }}
          kind="primary"
          type="submit">
          {isSubmitting ? (
            <span style={{ display: 'flex', justifyItems: 'center' }}>
              {t('submitting', 'Submitting...')} <InlineLoading status="active" iconDescription="Loading" />
            </span>
          ) : (
            t('postWaiver', 'Post waiver')
          )}
        </Button>
      </ButtonSet>
    </form>
  );
};
