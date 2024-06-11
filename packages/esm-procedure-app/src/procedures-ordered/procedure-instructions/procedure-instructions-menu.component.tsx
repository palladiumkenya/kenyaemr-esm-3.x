import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ProcedureInstructionsActionMenuProps {
  order: any;
  closeModal: () => void;
}

const ProcedureInstructionsActionMenu: React.FC<ProcedureInstructionsActionMenuProps> = ({ order }) => {
  const { t } = useTranslation();

  const launchProcedureInstructionsModal = useCallback(() => {
    const dispose = showModal('procedure-instructions-modal', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={t('procedureInstructionsModal', 'Procedure Instructions')}
      onClick={launchProcedureInstructionsModal}
      style={{
        maxWidth: '100vw',
      }}
    />
  );
};

export default ProcedureInstructionsActionMenu;
