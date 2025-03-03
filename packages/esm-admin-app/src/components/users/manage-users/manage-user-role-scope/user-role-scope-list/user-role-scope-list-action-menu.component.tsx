import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { launchOverlay } from '../../../../hook/overlay';
import StockUserRoleScopesList from './user-role-scope-list.component';

interface StockUserRoleListActionsMenuProps {
  userUuid?: string;
}

const StockUserRoleListActionsMenu: React.FC<StockUserRoleListActionsMenuProps> = ({ userUuid }) => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay('Manage Stock User Role Scope', <StockUserRoleScopesList userUuid={userUuid} />);
  }, [userUuid]);

  return (
    <OverflowMenuItem
      hasDivider
      onClick={() => {
        handleClick();
      }}
      itemText={t('manageUserRoleScope', 'Manage user role scope')}
    />
  );
};
export default StockUserRoleListActionsMenu;
