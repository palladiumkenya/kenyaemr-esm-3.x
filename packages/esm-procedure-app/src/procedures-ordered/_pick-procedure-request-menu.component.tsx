import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Order } from '../types/patient-queue';

interface PickLabRequestActionMenuProps {
  order: Order;
  closeModal: () => void;
}

const PickProcedureRequestActionMenu: React.FC<PickLabRequestActionMenuProps> = ({ order }) => {
  const { t } = useTranslation();

  const launchSelectProcedureRequestModal = useCallback(() => {
    const dispose = showModal('add-procedure-to-worklist-dialog', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={t('pickProcedureRequest', 'Pick Procedure Request')}
      onClick={launchSelectProcedureRequestModal}
      style={{
        maxWidth: '100vw',
      }}
    />
  );
};

export default PickProcedureRequestActionMenu;
