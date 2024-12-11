import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';
import OperationConfirmation from './components/confirm-modal/confirmation-operation-modal.component';

const options = {
  featureName: 'esm-admin-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const operationConfirmationModal = getSyncLifecycle(OperationConfirmation, options);
