import {
  getAsyncLifecycle,
  defineConfigSchema,
  getSyncLifecycle,
  registerBreadcrumbs,
  registerFeatureFlag,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './left-panel/morgue-left-panel-link.component';
import FormEntryWorkspace from './forms/form-entry-workspace/form-entry-workspace.workspace';
import PrintPostMortemOverflowMenuItem from './extension/overflow-menu-item-postmortem/print-postmorterm-report.component';
const moduleName = '@kenyaemr/esm-morgue-app';

const options = {
  featureName: 'esm-morgue-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  const morgueBasepath = `${window.spaBase}/home/morgue`;

  defineConfigSchema(moduleName, configSchema);
  registerBreadcrumbs([
    {
      title: 'morgue',
      path: morgueBasepath,
      parent: `${window.spaBase}/home`,
    },
  ]);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const morgueDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'morgue',
    title: 'Mortuary',
  }),
  options,
);

export const actionBarButtons = getAsyncLifecycle(() => import('./extension/actionButton.component'), options);
export const bannerInfo = getAsyncLifecycle(() => import('./extension/deceasedInfoBanner.component'), options);
export const admitDeceasedPersonForm = getAsyncLifecycle(
  () => import('./forms/admit-deceased-person-workspace/admit-deceased-person.workspace'),
  options,
);
export const swapForm = getAsyncLifecycle(
  () => import('./forms/swap-compartment-workspace/swap-unit.workspace'),
  options,
);
export const dischargeBodyForm = getAsyncLifecycle(
  () => import('./forms/discharge-deceased-person-workspace/discharge-body.workspace'),
  options,
);
export const mortuaryFormEntry = getSyncLifecycle(FormEntryWorkspace, options);
export const mortuaryChartView = getAsyncLifecycle(() => import('./view-details/main/main.component'), options);
export const printConfirmationModal = getAsyncLifecycle(
  () => import('./modals/mortuary-gate-pass/print-preview-confirmation.modal'),
  options,
);
export const autopsyReportModal = getAsyncLifecycle(
  () => import('./modals/autopsy-report/autopsy-print-preview-confirmation.modal'),
  options,
);

export const printPostMortemOverflowMenuItem = getSyncLifecycle(PrintPostMortemOverflowMenuItem, options);
