import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';
import OperationConfirmation from './components/confirm-modal/confirmation-operation-modal.component';
import Root from './root.component';
import ManageUserWorkspace from './components/users/manage-users/user-management.workspace';
import { createLeftPanelLink } from './left-pannel-link.component';

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
