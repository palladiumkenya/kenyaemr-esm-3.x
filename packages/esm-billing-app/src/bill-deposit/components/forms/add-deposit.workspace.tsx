import React, { useEffect } from 'react';
import {
  type DefaultWorkspaceProps,
  ResponsiveWrapper,
  useLayoutType,
  useSession,
  showToast,
  showSnackbar,
  restBaseUrl,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import styles from './add-deposit.workspace.scss';
import { ButtonSet, Button, InlineLoading, TextInput, NumberInput } from '@carbon/react';
import classNames from 'classnames';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { mutate } from 'swr';
import { type BillDeposit } from '../../types/bill-deposit.types';
import { generateReferenceNumber, saveDeposit } from '../../utils/bill-deposit.utils';

type AddDepositWorkspaceProps = DefaultWorkspaceProps & {
  patientUuid: string;
  deposit?: BillDeposit;
};

const depositFormSchema = z.object({
  patient: z.string().min(1),
  amount: z.number().min(1),
  depositType: z.string().min(1),
  referenceNumber: z.string().min(1),
  description: z.string().min(1),
});

type DepositFormType = z.infer<typeof depositFormSchema>;

const AddDepositWorkspace: React.FC<AddDepositWorkspaceProps> = ({
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  deposit,
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const location = session?.sessionLocation?.display;
  const isTablet = useLayoutType() === 'tablet';
  const defaultValues = deposit
    ? {
        patient: deposit.patient.uuid,
        amount: deposit.amount,
        depositType: deposit.depositType,
        referenceNumber: deposit.referenceNumber,
        description: deposit.description,
      }
    : {
        patient: patientUuid,
        amount: 0,
        depositType: '',
        referenceNumber: generateReferenceNumber(location ?? ''),
        description: '',
      };
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<DepositFormType>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data: DepositFormType) => {
    const deposityPayload: Partial<BillDeposit> = {
      patient: patientUuid as any,
      amount: data.amount,
      depositType: data.depositType,
      referenceNumber: data.referenceNumber,
      description: data.description,
      status: deposit?.status ?? 'PENDING',
    };

    try {
      const response = await saveDeposit(deposityPayload, deposit?.uuid);
      if (response.status === 201 || response.status === 200) {
        showSnackbar({
          title: t('success', 'Success'),
          kind: 'success',
          subtitle:
            response.status === 201
              ? t('depositCreated', 'Deposit created successfully')
              : t('depositSaved', 'Deposit saved successfully'),
        });
      }
      mutate(
        (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/deposit?patient=${patientUuid}`),
        undefined,
        { revalidate: true },
      );
      closeWorkspaceWithSavedChanges();
    } catch (error: any) {
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: error?.message ?? t('depositSaveError', 'Error saving deposit'),
      });
    }
  };

  const handleError = (err) => {
    showToast({
      title: t('error', 'Error'),
      kind: 'error',
      description: t('formError', 'Please check the form for errors'),
    });
  };

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty]);

  return (
    <form onSubmit={handleSubmit(onSubmit, handleError)} className={styles.form}>
      <div className={styles.formContainer}>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="depositType"
            render={({ field }) => (
              <TextInput
                id="depositType"
                placeholder={t('depositType', 'Deposit Type')}
                labelText={t('depositType', 'Deposit Type')}
                value={field.value}
                onChange={field.onChange}
                invalid={!!errors.depositType?.message}
                invalidText={errors.depositType?.message}
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
                invalidText={errors.amount?.message}
                label={t('amount', 'Amount')}
                onChange={(e, { value }) => field.onChange(parseInt(value.toString(), 10))}
                size="md"
                step={1}
                value={field.value}
              />
            )}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="referenceNumber"
            render={({ field }) => (
              <TextInput
                id="referenceNumber"
                placeholder={t('referenceNumber', 'Reference Number')}
                labelText={t('referenceNumber', 'Reference Number')}
                value={field.value}
                onChange={field.onChange}
                invalid={!!errors.referenceNumber?.message}
                invalidText={errors.referenceNumber?.message}
                readOnly
              />
            )}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextInput
                id="description"
                placeholder={t('description', 'Description')}
                labelText={t('description', 'Description')}
                value={field.value}
                onChange={field.onChange}
                invalid={!!errors.description?.message}
                invalidText={errors.description?.message}
              />
            )}
          />
        </ResponsiveWrapper>
      </div>
      <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button style={{ maxWidth: '50%' }} kind="secondary" onClick={() => closeWorkspace()}>
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

export default AddDepositWorkspace;
