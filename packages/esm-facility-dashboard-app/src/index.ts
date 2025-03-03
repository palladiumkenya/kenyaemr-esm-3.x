import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { moduleName } from './constants';
import Root from './root.component';
import { createLeftPanelLink } from './left-pannel-link.component';

const options = {
  featureName: 'esm-facility-dashboard-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const root = getSyncLifecycle(Root, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const surveillanceDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ title: 'Surveillance', name: '' }),
  options,
);

export const aboveSiteDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ title: 'Above site Dashboard', name: 'above-site' }),
  options,
);
