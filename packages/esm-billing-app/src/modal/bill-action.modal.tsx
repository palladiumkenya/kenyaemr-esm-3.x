import React from 'react';
import { ModalBody, ModalFooter, ModalHeader, Button, Heading, TextArea } from '@carbon/react';
import { type MappedBill } from '../types';
import { useTranslation } from 'react-i18next';
import { convertToCurrency } from '../helpers';
import { reOpenOrCloseBill } from '../invoice/invoice.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './bill-action.modal.scss';

type BillActionModalProps = {
  closeModal: () => void;
  bill: MappedBill;
  action: 'close' | 'reopen';
};

const formSchema = z.object({
  reason: z.string().min(1, { message: 'Reason is required' }),
});

type FormData = z.infer<typeof formSchema>;

const BillActionModal: React.FC<BillActionModalProps> = (props) => {
  const { closeModal, bill, action } = props;
  const { t } = useTranslation();
  const formMethod = useForm({
    defaultValues: {
      reason: '',
    },
    resolver: zodResolver(formSchema),
  });

  const modalExplanation =
    action === 'close'
      ? t('closeBillExplanation', 'Closing this bill will prevent any new items from being added to this bill')
      : t('reopenBillExplanation', 'Reopening this bill will allow new items to be added to this bill');

  const handleCloseBill = async (data: FormData) => {
    try {
      const response = await reOpenOrCloseBill(bill?.uuid, action, {
        reason: data.reason,
      });
      if (response?.ok) {
        showSnackbar({
          title: t('billClosedSuccessfully', 'Bill {{action}} successfully', { action: action }),
          subtitle: t('billClosedSuccessfullySubtitle', 'The bill has been {{action}} successfully', {
            action: action,
          }),
          kind: 'success',
          timeoutInMs: 3000,
          isLowContrast: true,
        });
      } else {
        throw new Error('Failed to close bill');
      }
    } catch (error) {
      const errorResponseBody =
        error?.responseBody?.error?.message ||
        t('errorResponseBodyMessage', 'An error occurred while closing the bill');

      showSnackbar({
        title: t('billClosedFailed', 'Bill closing failed'),
        subtitle: errorResponseBody,
        kind: 'error',
        timeoutInMs: 3000,
        isLowContrast: true,
      });
    } finally {
      const url = `/ws/rest/v1/cashier/bill/${bill.uuid}`;
      mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
      closeModal();
    }
  };
  return (
    <form onSubmit={formMethod.handleSubmit(handleCloseBill, (error) => console.error('error', error))}>
      <ModalHeader
        closeModal={closeModal}
        label={t('billActionWithDetails', '{{action}} Bill - {{receiptNumber}} ({{status}}, {{amount}})', {
          action: action === 'close' ? t('close', 'Close') : t('reopen', 'Reopen'),
          receiptNumber: bill?.receiptNumber,
          status: bill?.status,
          amount: bill?.totalAmount ? `${convertToCurrency(bill?.totalAmount)}` : 'N/A',
        })}
        title={t('billAction', '{{action}} Bill', {
          action: action === 'close' ? t('close', 'Close') : t('reopen', 'Reopen'),
        })}
      />
      <ModalBody>
        <div>
          <p className={styles.modalExplanation}>{modalExplanation}</p>
        </div>
        <Controller
          control={formMethod.control}
          name="reason"
          render={({ field }) => (
            <TextArea
              id="reason"
              labelText={t('reason', 'Reason for {{action}} bill', { action: action })}
              placeholder={t('reason', 'Reason for {{action}} bill', { action: action })}
              rows={4}
              onChange={field.onChange}
              value={field.value}
              invalid={!!formMethod.formState.errors.reason}
              invalidText={formMethod.formState.errors.reason?.message}
            />
          )}
        />
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!formMethod.formState.isValid} type="submit" kind="danger">
          {action === 'close' ? t('close', 'Close') : t('reopen', 'Reopen')}
        </Button>
      </ModalFooter>
    </form>
  );
};

export default BillActionModal;
