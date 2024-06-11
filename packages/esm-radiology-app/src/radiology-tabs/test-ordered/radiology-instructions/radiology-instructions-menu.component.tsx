import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface RadiologyInstructionsActionMenuProps {
  order: any;
  closeModal: () => void;
}

const RadiologyInstructionsActionMenu: React.FC<RadiologyInstructionsActionMenuProps> = ({ order }) => {
  const { t } = useTranslation();

  const launchRadiologyInstructionsModal = useCallback(() => {
    const dispose = showModal('radiology-instructions-modal', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={t('radiologyInstructionsModal', 'Radiology Instructions')}
      onClick={launchRadiologyInstructionsModal}
      style={{
        maxWidth: '100vw',
      }}
    />
  );
};

export default RadiologyInstructionsActionMenu;
