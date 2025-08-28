import React from 'react';
import { DefaultWorkspaceProps } from '@openmrs/esm-framework';

type ExpressWorkflowWorkspaceProps = DefaultWorkspaceProps & {
  state?: {
    patient?: any;
    patientUuid?: string;
  };
};

const ExpressWorkflowWorkspace: React.FC<ExpressWorkflowWorkspaceProps> = (props) => {
  const { closeWorkspace, state } = props;
  const { patient, patientUuid } = state || {};

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Express Workflow Workspace</h2>
      {patient && (
        <div>
          <p>
            <strong>Patient:</strong> {patient.person?.display || 'Unknown'}
          </p>
          <p>
            <strong>Patient UUID:</strong> {patientUuid}
          </p>
        </div>
      )}
      <button onClick={() => closeWorkspace()}>Close Workspace</button>
    </div>
  );
};

export default ExpressWorkflowWorkspace;
