import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';
import OperationConfirmation from './components/confirm-modal/confirmation-operation-modal.component';
import Root from './root.component';
import SideMenu from './components/side-menu/side-menu.component';
import appMenu from './components/admin-app-menu-item/item.component';
import UserManagentLandingPage from './components/users/manage-users/manage-user.component';
import { createUserManagementLink } from './createUserManagementLink';
import ManageUserWorkspace from './components/users/manage-users/manage-user.workspace';
import Dashboard from './components/dashboard/dashboard.component';

const options = {
  featureName: 'esm-admin-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const adminNavMenu = getSyncLifecycle(SideMenu, options);
export const root = getSyncLifecycle(Root, options);
export const adminAppMenuItem = getSyncLifecycle(appMenu, options);

// t("manageUsers","Manage Users")
export const userManagement = getSyncLifecycle(UserManagentLandingPage, options);
export const userManagementLink = getSyncLifecycle(
  createUserManagementLink({ title: 'Manage Users', name: 'user-management' }),
  options,
);

// t("etlAdministration","ETL Administration")
export const etlAdministration = getSyncLifecycle(Dashboard, options);
export const etlAdministrationDashboardLink = getSyncLifecycle(
  createUserManagementLink({ title: 'ETL Administration', name: 'etl-administration' }),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const operationConfirmationModal = getSyncLifecycle(OperationConfirmation, options);
export const manageUserWorkspace = getSyncLifecycle(ManageUserWorkspace, options);
