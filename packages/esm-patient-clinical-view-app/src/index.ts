import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import MaternalHealthList from './esm-mch-app/views/maternal-health/maternal-health.component';
import './root.scss';
import { createDashboardGroup } from './clinical-view-group/createDashboardGroup';
import { ClinicalDashboardGroup, mchDashboardMeta } from './dashboard.meta';
const moduleName = '@kenyaemr/esm-patient-clinical-view-app';

const options = {
  featureName: 'patient-clinical-view-app',
  moduleName,
};
export const clinicalViewGroup = getSyncLifecycle(createDashboardGroup(ClinicalDashboardGroup), options);
export const mchDashboardLink = getSyncLifecycle(createDashboardLink(mchDashboardMeta), options);
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const mchClinicalView = getSyncLifecycle(MaternalHealthList, options);
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
