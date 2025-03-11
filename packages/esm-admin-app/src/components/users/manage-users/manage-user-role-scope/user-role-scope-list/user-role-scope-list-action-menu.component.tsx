import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { launchWorkspace, navigate } from '@openmrs/esm-framework';
import { launchOverlay } from '../../../../hook/overlay';
import StockUserRoleScopesList from './user-role-scope-list.component';
import { User } from '../../../../../config-schema';

interface StockUserRoleListActionsMenuProps {
  user?: User;
}

const StockUserRoleListActionsMenu: React.FC<StockUserRoleListActionsMenuProps> = ({ user }) => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchWorkspace('user-role-scope-workspace', {
      workspaceTitle: t('editRoleScope', 'Edit User Role Scope'),
      userUuid: user.uuid,
    });
  }, [user]);

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
