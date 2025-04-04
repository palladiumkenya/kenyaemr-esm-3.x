import { Button } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';

const CheckPaymentStatus = () => {
  const { t } = useTranslation();
  const handleLaunchPaymentStatusCheckerModal = () => {
    const dispose = showModal('payment-status-checker-modal', { onClose: () => dispose() });
  };
  return (
    <Button
      onClick={handleLaunchPaymentStatusCheckerModal}
      kind="tertiary"
      size="sm"
      iconDescription="Add"
      tooltipPosition="right">
      {t('checkPaymentstatus', 'Check payment status')}
    </Button>
  );
};

export default CheckPaymentStatus;
