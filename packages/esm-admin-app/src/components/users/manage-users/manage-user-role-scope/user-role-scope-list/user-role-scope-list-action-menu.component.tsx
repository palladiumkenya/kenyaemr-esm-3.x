import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRoleScope } from '../../../../../config-schema';
import { OverflowMenuItem } from '@carbon/react';
import { launchOverlay } from '../../../../hook/overlay';
import SimpleOverlayContent from '../../user-list/sample.component';

const StockUserRoleListActionsMenu: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay('Manage Stock User Role Scope', <SimpleOverlayContent />);
  }, []);

  return (
    <OverflowMenuItem
      hasDivider
      onClick={() => {
        handleClick();
      }}
      itemText={t('manageRoleScope', 'Manage stock user role scope')}
    />
  );
};
export default StockUserRoleListActionsMenu;
