import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import aboutLinkComponent from './about-link.component';
import rootComponent from './root.component';

const moduleName = '@kenyaemr/esm-version-app';

const options = {
  featureName: 'esm-version-app',
  moduleName,
};

export const importTranslations = require.context('../translations', false, /.json$/, 'lazy');

export const about = getSyncLifecycle(rootComponent, options);
export const aboutLink = getSyncLifecycle(aboutLinkComponent, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
