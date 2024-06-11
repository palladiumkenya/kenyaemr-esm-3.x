import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, translateFrom } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

import { createLeftPanelLink } from './left-panel-link';
import worklistTile from './metrics-tiles/worklist-tile.component';
import referredTile from './metrics-tiles/referred-tile.component';
import testsOrdered from './metrics-tiles/procedure-ordered-tile.component';
import reviewTile from './metrics-tiles/review-tile.component';
import approveTile from './metrics-tiles/approved-tile.component';
import rejectedTile from './metrics-tiles/rejected-tile.component';
import addRadiologyToWorklistDialog from './radiology-tabs/test-ordered/pick-radiology-order/add-to-worklist-dialog.component';
import rejectOrderDialogComponent from './radiology-tabs/test-ordered/reject-order-dialog/reject-order-dialog.component';
import radiologyInstructionsModal from './radiology-tabs/test-ordered/radiology-instructions/radiology-instructions.component';
import ReviewOrderDialog from './radiology-tabs/review-ordered/review-radiology-report-dialog/review-radiology-report-dialog.component';
import RadiologyOrderBasketPanelExtension from './form/radiology-orders/radiology-order-basket-panel/radiology-order-basket-panel.extension';
import radiologyRejectReasonModal from './radiology-tabs/test-ordered/reject-order-dialog/radiology-reject-reason.component';
const moduleName = '@openmrs/esm-radiology-app';

const options = {
  featureName: 'openmrs/esm-radiology-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const radiologyDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'radiology',
    title: 'Radiology',
  }),
  options,
);

// Tiles
export const worklistTileComponent = getSyncLifecycle(worklistTile, options);
export const referredTileComponent = getSyncLifecycle(referredTile, options);
export const testOrderedTileComponent = getSyncLifecycle(testsOrdered, options);
export const reviewTileComponent = getSyncLifecycle(reviewTile, options);
export const approveTileComponent = getSyncLifecycle(approveTile, options);
export const notDoneTileComponent = getSyncLifecycle(rejectedTile, options);
export const addRadiologyToWorklistDialogComponent = getSyncLifecycle(addRadiologyToWorklistDialog, options);

// Modals
export const rejectOrderDialog = getSyncLifecycle(rejectOrderDialogComponent, options);
export const radiologyInstructionsModalComponent = getSyncLifecycle(radiologyInstructionsModal, options);
export const reviewRadiologyReportDialog = getSyncLifecycle(ReviewOrderDialog, options);

export const radiologyOrderPanel = getSyncLifecycle(RadiologyOrderBasketPanelExtension, options);
export const radiologyRejectReasonModalComponent = getSyncLifecycle(radiologyRejectReasonModal, options);

// t('addRadiologyOrderWorkspaceTitle', 'Add Radiology order')
export const addRadiologyOrderWorkspace = getAsyncLifecycle(
  () => import('./form/radiology-orders/add-radiology-order/add-radiology-order.workspace'),
  options,
);
