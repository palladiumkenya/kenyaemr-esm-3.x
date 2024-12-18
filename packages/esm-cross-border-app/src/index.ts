import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import CrossBorderApp from './root.component';

const moduleName = '@kenyaemr/esm-cross-border-app';

const options = {
  featureName: 'cross-border',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const crossBorderApp = getSyncLifecycle(CrossBorderApp, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
