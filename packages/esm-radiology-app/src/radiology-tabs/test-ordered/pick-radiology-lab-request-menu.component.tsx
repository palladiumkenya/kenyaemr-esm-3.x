import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface PickRadiologyLabRequestActionMenuProps {
  order: any;
  closeModal: () => void;
}

const PickRadiologyLabRequestActionMenu: React.FC<PickRadiologyLabRequestActionMenuProps> = ({ order }) => {
  const { t } = useTranslation();

  const launchPickLabRequestModal = useCallback(() => {
    const dispose = showModal('add-radiology-to-worklist-dialog', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={t('pickRequest', 'Pick Request')}
      onClick={launchPickLabRequestModal}
      style={{
        maxWidth: '100vw',
      }}
    />
  );
};

export default PickRadiologyLabRequestActionMenu;
