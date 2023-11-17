import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';

const moduleName = '@kenyaemr/esm-version-app';

const options = {
  featureName: 'esm-version-app',
  moduleName,
};

export const importTranslations = require.context('../translations', false, /.json$/, 'lazy');

export const about = getAsyncLifecycle(() => import('./root.component'), options);

export const aboutLink = getAsyncLifecycle(() => import('./about-link.component'), options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
