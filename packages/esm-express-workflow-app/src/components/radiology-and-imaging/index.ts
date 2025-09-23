import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import RadiologyAndImagingTabs from './radiology-and-imaging.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib/src';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const radiologyAndImagingDashboard = getSyncLifecycle(RadiologyAndImagingTabs, options);
// t('Radiology and Imaging', 'Radiology and Imaging')
export const radiologyAndImagingLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    path: 'radiology-and-imaging',
    title: 'Radiology and Imaging',
    icon: 'omrs-icon-user-xray',
  }),
  options,
);
