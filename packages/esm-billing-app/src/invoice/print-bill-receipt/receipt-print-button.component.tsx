import { Button } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { restBaseUrl, showModal } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MappedBill, PaymentStatus } from '../../types';
import startCase from 'lodash-es/startCase';

interface ReceiptPrintButtonProps {
  bill: MappedBill;
}

const ReceiptPrintButton: React.FC<ReceiptPrintButtonProps> = ({ bill }) => {
  const { t } = useTranslation();

  const isPrintingDisabled = shouldDisablePrinting(bill);

  const handlePrintClick = () => {
    const dispose = showModal('print-preview-modal', {
      onClose: () => dispose(),
      title: `${t('receipt', 'Receipt')} ${bill?.receiptNumber} - ${startCase(bill?.patientName)}`,
      documentUrl: `/openmrs${restBaseUrl}/cashier/receipt?billId=${bill.id}`,
    });
  };

  return (
    <Button
      kind="secondary"
      size="sm"
      disabled={isPrintingDisabled}
      onClick={handlePrintClick}
      renderIcon={Printer}
      iconDescription={t('printReceipt', 'Print receipt')}>
      {t('printReceipt', 'Print receipt')}
    </Button>
  );
};

/**
 * Determines if receipt printing should be disabled based on bill status
 * @param bill - The bill to check
 * @returns true if printing should be disabled, false otherwise
 */
function shouldDisablePrinting(bill: MappedBill): boolean {
  const hasPayments = bill.payments.length > 0;
  const hasExemptedItems = bill.lineItems.some((item) => item.paymentStatus === PaymentStatus.EXEMPTED);

  // If there are exempted items, we need special handling
  if (hasExemptedItems) {
    return !hasExemptedItems;
  }

  // For regular bills, disable if there are no payments
  return !hasPayments;
}

export default ReceiptPrintButton;
