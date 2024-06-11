import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface PickProcedureRequestActionMenuProps {
  order: any;
  closeModal: () => void;
}

const PickProcedureRequestActionMenu: React.FC<PickProcedureRequestActionMenuProps> = ({ order }) => {
  const { t } = useTranslation();

  const launchPickProcedureRequestModal = useCallback(() => {
    const dispose = showModal('add-procedure-to-worklist-dialog', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={t('pickRequest', 'Pick Request')}
      onClick={launchPickProcedureRequestModal}
      style={{
        maxWidth: '100vw',
      }}
    />
  );
};

export default PickProcedureRequestActionMenu;
