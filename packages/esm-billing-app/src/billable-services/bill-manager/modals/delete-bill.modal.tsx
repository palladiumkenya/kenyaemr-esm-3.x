import React from 'react';
import { ModalBody, ModalFooter, Button, TextArea } from '@carbon/react';
import cancelBillStyles from './delete-services.scss';
import { LineItem, MappedBill, PaymentStatus } from '../../../types';
import { processBillPayment } from '../../../billing.resource';
import { ResponsiveWrapper, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

type DeleteBillModalProps = {
  onClose: () => void;
  bill: MappedBill;
};

const formatLineItem = (props: LineItem) => ({
  item: props.item,
  quantity: props.quantity,
  price: props.price,
  priceName: props.priceName,
  priceUuid: props.priceUuid,
  lineItemOrder: props.lineItemOrder,
  paymentStatus: PaymentStatus.CANCELLED,
  voided: props.voided,
  voidReason: props.voidReason,
});
const deleteBillPayload = (bill: MappedBill, reason: string) => {
  return {
    cashPoint: bill.cashPointUuid,
    cashier: bill.cashier.uuid,
    lineItems: bill.lineItems.map((li) => formatLineItem({ ...li, voided: true, voidReason: reason })),
    payments: bill.payments,
    patient: bill.patientUuid,
    status: PaymentStatus.CANCELLED,
    voided: true,
    voidReason: reason,
    billAdjusted: bill.uuid,
  };
};

const deleteSchema = z.object({
  reason: z.string().min(1, { message: 'Reason is required' }),
});

type DeleteBillFormData = z.infer<typeof deleteSchema>;

export const DeleteBillModal: React.FC<DeleteBillModalProps> = ({ onClose, bill }) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
  } = useForm<DeleteBillFormData>({
    resolver: zodResolver(deleteSchema),
  });
  const onSubmit = async (formData: DeleteBillFormData) => {
    const payload = deleteBillPayload(bill, formData.reason);
    try {
      const response = await processBillPayment(payload, bill.uuid);
      if (response.ok) {
        showSnackbar({
          title: t('billDelete', 'Bill delete'),
          subtitle: t('billDeleteSuccess', 'Bill delete was successful'),
          kind: 'success',
          timeoutInMs: 5000,
        });
        // mutate the bill
        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/cashier/bill?status`), undefined, {
          revalidate: true,
        });
        onClose();
      }
    } catch (error) {
      showSnackbar({
        title: t('billDelete', 'Bill delete'),
        subtitle: t('billDeleteError', 'An error occurred while deleting the bill'),
        kind: 'error',
        timeoutInMs: 5000,
      });
    }
  };

  return (
    <React.Fragment>
      <div className={cancelBillStyles.modalHeaderLabel}>{t('deleteBill', 'Delete bill')}</div>
      <ModalBody>
        <p className={cancelBillStyles.modalHeaderHeading}>
          {t(
            'deleteBillConfirmation',
            'Are you sure you want to delete this bill? All line items in this bill will be deleted. This action cannot be undone.',
          )}
        </p>
        <ResponsiveWrapper>
          <Controller
            control={control}
            name="reason"
            render={({ field, fieldState: { error } }) => (
              <TextArea
                {...field}
                className={cancelBillStyles.formField}
                labelText={t('enterReasonForDeletingBill', 'Enter reason for deleting bill')}
                placeholder={t('enterReasonForDeletingBill', 'Enter reason for deleting bill')}
                invalid={!!error}
                invalidText={error?.message}
              />
            )}
          />
        </ResponsiveWrapper>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" disabled={!isValid || isSubmitting} onClick={handleSubmit(onSubmit)}>
          {t('continue', 'Continue')}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
