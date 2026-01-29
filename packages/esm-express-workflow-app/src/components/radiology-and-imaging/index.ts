import { getSyncLifecycle } from '@openmrs/esm-framework';

import { createDashboardLink } from '@openmrs/esm-patient-common-lib/src';
import { moduleName } from '../../constants';
import RadiologyAndImagingTabs from './radiology-and-imaging.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const radiologyAndImagingDashboard = getSyncLifecycle(RadiologyAndImagingTabs, options);
// t('radiologyAndImaging', 'Radiology and Imaging')
export const radiologyAndImagingLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    path: 'radiology-and-imaging',
    title: 'radiologyAndImaging',
    icon: 'omrs-icon-user-xray',
  }),
  options,
);
