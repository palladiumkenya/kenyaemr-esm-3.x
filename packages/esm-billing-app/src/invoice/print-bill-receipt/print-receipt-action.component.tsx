import { Button } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MappedBill } from '../../types';

type PrintPaidBillReceiptActionProps = {
  bill: MappedBill;
};

const PrintPaidBillReceiptAction: React.FC<PrintPaidBillReceiptActionProps> = ({ bill }) => {
  const { t } = useTranslation();

  const handleClick = () => {
    const dispose = showModal('paid-bill-receipt-print-preview-modal', {
      onClose: () => dispose(),
      bill,
    });
  };
  return (
    <Button
      kind="secondary"
      size="sm"
      disabled={bill?.status !== 'PAID'}
      onClick={handleClick}
      renderIcon={Printer}
      iconDescription="Add">
      {t('printRecept', 'Print receipt')}
    </Button>
  );
};

export default PrintPaidBillReceiptAction;
