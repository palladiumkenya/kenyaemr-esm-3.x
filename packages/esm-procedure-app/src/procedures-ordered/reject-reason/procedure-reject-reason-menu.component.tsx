import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ProcedureRejectionActionMenuProps {
  order: any;
  closeModal: () => void;
}

const ProcedureRejectionActionMenu: React.FC<ProcedureRejectionActionMenuProps> = ({ order }) => {
  const { t } = useTranslation();

  const launchProcedureRejectionModal = useCallback(() => {
    const dispose = showModal('procedure-reject-reason-modal', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={t('procedureRejectionModal', 'Procedure Rejection')}
      onClick={launchProcedureRejectionModal}
      style={{
        maxWidth: '100vw',
      }}
    />
  );
};

export default ProcedureRejectionActionMenu;
