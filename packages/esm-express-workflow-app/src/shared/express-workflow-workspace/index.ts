import { getSyncLifecycle } from '@openmrs/esm-framework';
import ExpressWorkflowWorkspace from './express-workflow.workspace';
import { moduleName } from '../../constants';

export const expressWorkflowWorkspace = getSyncLifecycle(ExpressWorkflowWorkspace, {
  featureName: 'express-workflow-workspace',
  moduleName,
});
