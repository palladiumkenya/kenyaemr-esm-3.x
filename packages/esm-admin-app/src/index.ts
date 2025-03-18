import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';
import OperationConfirmation from './components/confirm-modal/confirmation-operation-modal.component';
import Root from './root.component';
import ManageUserWorkspace from './components/users/manage-users/user-management.workspace';
import { createLeftPanelLink } from './left-pannel-link.component';
import HWRConfirmModal from './components/modal/hwr-confirmation.modal';
import HWREmptyModal from './components/modal/hwr-empty.modal.component';
import UserRoleScopeWorkspace from './components/users/manage-users/manage-user-role-scope/user-role-scope-workspace/user-role-scope.workspace';
import HWRSyncModal from './components/modal/hwr-sync.modal';

const options = {
  featureName: 'esm-admin-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const root = getSyncLifecycle(Root, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const operationConfirmationModal = getSyncLifecycle(OperationConfirmation, options);
export const manageUserWorkspace = getSyncLifecycle(ManageUserWorkspace, options);
export const userRoleScopeWorkspace = getSyncLifecycle(UserRoleScopeWorkspace, options);

export const userManagementLeftPannelLink = getSyncLifecycle(
  createLeftPanelLink({ title: 'Manage Users', name: 'user-management' }),
  options,
);

export const etlAdministrationLeftPannelLink = getSyncLifecycle(
  createLeftPanelLink({ title: 'ETL Administration', name: 'etl-administration' }),
  options,
);
export const facilitySetupLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({ title: 'Facility Details', name: 'facility-setup' }),
  options,
);

export const hwrConfirmationModal = getSyncLifecycle(HWRConfirmModal, options);
export const hwrEmptyModal = getSyncLifecycle(HWREmptyModal, options);
export const hwrSyncModal = getSyncLifecycle(HWRSyncModal, options);
