import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z, { isDirty, isValid } from 'zod';
import classNames from 'classnames';
import {
  type DefaultWorkspaceProps,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import { Button, ButtonSet, InlineLoading, NumberInput, DropdownSkeleton, Dropdown } from '@carbon/react';
import styles from './bill-deposit.scss';
import { BillingConfig } from '../../config-schema';
import { processBillItems, usePaymentModes } from '../../billing.resource';
import { BillingService, PaymentMethod } from '../../types';
import { mutate } from 'swr';
import useBillableServices from '../../hooks/useBillableServices';

type BillDepositWorkspaceProps = DefaultWorkspaceProps & {
  patientUuid: string;
  patient: fhir.Patient;
};

const BillDepositWorkspace: React.FC<BillDepositWorkspaceProps> = ({
  patientUuid,
  patient,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const { cashPointUuid, cashierUuid } = useConfig<BillingConfig>();
  const { paymentModes, isLoading: isPaymentModesLoading } = usePaymentModes();
  const { billableServices, isLoading: isBillableServicesLoading } = useBillableServices();
  const isTablet = useLayoutType() === 'tablet';
  const defaultPaymentStatus = 'PAID';
  const billDepositFormSchema = z.object({
    amount: z
      .number()
      .min(0, { message: t('amountToBeDepositedInvalidText', 'Amount to be deposited is must be greater than 0') }),
    paymentMode: z.object({
      uuid: z.string(),
      name: z.string(),
      description: z.string().optional(),
      retired: z.boolean().optional(),
      retireReason: z.null().optional(),
      auditInfo: z.any().optional(),
      attributeTypes: z.array(z.any()).optional(),
      sortOrder: z.null().optional(),
      resourceVersion: z.string().optional(),
    }) as z.ZodType<PaymentMethod>,
    billableService: z.object({
      uuid: z.string(),
      name: z.string(),
      shortName: z.string(),
      serviceStatus: z.string(),
      serviceType: z.object({
        display: z.string(),
      }),
      servicePrices: z.array(
        z.object({
          uuid: z.string(),
          name: z.string(),
          paymentMode: z.object({
            uuid: z.string(),
            name: z.string(),
          }),
          price: z.number(),
        }),
      ),
      description: z.string().optional(),
      retired: z.boolean().optional(),
      retireReason: z.null().optional(),
    }) as z.ZodType<BillingService>,
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<z.infer<typeof billDepositFormSchema>>({
    resolver: zodResolver(billDepositFormSchema),
  });

  const handleCreateBill = async (formData: z.infer<typeof billDepositFormSchema>) => {
    const billableService = formData.billableService;
    const servicePrice = billableService?.servicePrices.find((price) => price.uuid === formData.paymentMode.uuid);
    // if the service price is greater than the amount, then the payment status is paid, otherwise it is pending
    const paymentStatus = Number(formData.amount) >= Number(servicePrice?.price) ? 'PAID' : 'PENDING';
    const createBillPayload = {
      cashPoint: cashPointUuid,
      cashier: cashierUuid,
      patient: patientUuid,
      status: paymentStatus,
      lineItems: [
        {
          billableService: billableService.uuid,
          lineItemOrder: 0,
          quantity: 1,
          price: servicePrice?.price,
          paymentStatus: paymentStatus,
          priceUuid: '',
          priceName: billableService.name,
        },
      ],
      payments: [
        {
          amount: servicePrice?.price,
          amountTendered: formData.amount,
          attributes: [],
          instanceType: servicePrice.paymentMode.uuid,
        },
      ],
    };
    const response = await processBillItems(createBillPayload);
    if (response.ok) {
      showSnackbar({
        title: t('success', 'Success'),
        kind: 'success',
        subtitle: t('billDepositSuccess', 'Bill deposit successful'),
        isLowContrast: true,
      });
      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/bill`), undefined, {
        revalidate: true,
      });
      closeWorkspaceWithSavedChanges();
    } else {
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: t('billDepositError', 'Bill deposit failed'),
        isLowContrast: true,
      });
    }
  };

  useEffect(() => {
    if (isDirty) {
      promptBeforeClosing(() => true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, promptBeforeClosing]);

  const billableService = Array.from(watch('billableService')?.servicePrices ?? []);

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleCreateBill)}>
      <div className={styles.formContainer}>
        <ResponsiveWrapper>
          {isBillableServicesLoading ? (
            <DropdownSkeleton />
          ) : (
            <Controller
              control={control}
              name="billableService"
              render={({ field }) => (
                <Dropdown
                  {...field}
                  onChange={({ selectedItem }) => field.onChange(selectedItem)}
                  id="billable-service"
                  invalidText={t('invalidBillableService', 'Invalid billable service')}
                  itemToString={(item) => item.name}
                  items={billableServices ?? []}
                  label={t('selectBillableService', 'Select billable service')}
                  titleText={t('service', 'Service')}
                />
              )}
            />
          )}
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          {isPaymentModesLoading ? (
            <DropdownSkeleton />
          ) : (
            <Controller
              control={control}
              name="paymentMode"
              render={({ field }) => (
                <Dropdown
                  {...field}
                  id="payment-mode"
                  invalidText={t('invalidPaymentMode', 'Invalid payment mode')}
                  itemToString={(item) => `${item.name} - ${item.price}`}
                  items={billableService ?? []}
                  onChange={({ selectedItem }) => field.onChange(selectedItem)}
                  label={t('paymentMode', 'Payment mode')}
                  titleText={t('paymentMode', 'Payment mode')}
                  type="default"
                  warnText={t('pleaseSelectPaymentMode', 'Please select a payment mode')}
                  invalid={!!errors.paymentMode}
                />
              )}
            />
          )}
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <NumberInput
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                helperText={t(
                  'amountToBeDepositedHelperText',
                  'Amount to be deposited for the patient before receiving services',
                )}
                label={t('amountToBeDeposited', 'Amount to be deposited')}
                invalidText={t('amountToBeDepositedInvalidText', 'Amount to be deposited is invalid')}
                invalid={!!errors.amount}
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
            <InlineLoading className={styles.spinner} description={t('postingDeposit', 'Posting deposit...')} />
          ) : (
            <span>{t('postDeposit', 'Post deposit')}</span>
          )}
        </Button>
      </ButtonSet>
    </form>
  );
};

export default BillDepositWorkspace;
