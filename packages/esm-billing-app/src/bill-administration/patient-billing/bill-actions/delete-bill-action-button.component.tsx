import React from 'react';
import { Button } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { MappedBill, PaymentStatus } from '../../../types';
import { showModal } from '@openmrs/esm-framework';

type DeleteBillActionButtonProps = {
  bill: MappedBill;
};

const DeleteBillActionButton: React.FC<DeleteBillActionButtonProps> = ({ bill }) => {
  const { t } = useTranslation();

  if (bill.status == PaymentStatus.PAID) {
    return null;
  }
  const handleOpenDeleteBillModal = (bill: MappedBill) => {
    const dispose = showModal('delete-bill-modal', {
      bill,
      onClose: () => dispose(),
    });
  };

  return (
    <Button
      onClick={() => handleOpenDeleteBillModal(bill)}
      size="sm"
      renderIcon={(props) => <TrashCan size={24} {...props} />}
      kind="danger--ghost"
      iconDescription="TrashCan">
      {t('deleteBill', 'Delete Bill')}
    </Button>
  );
};

export default DeleteBillActionButton;
