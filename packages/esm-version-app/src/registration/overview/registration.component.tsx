import React from 'react';
import { ExtensionSlot, WorkspaceContainer } from '@openmrs/esm-framework';

const Registration = () => {
  return (
    <div>
      <ExtensionSlot name="registration-dashboard-slot" />
      <WorkspaceContainer key="registration" contextKey="registration" />
    </div>
  );
};

export default Registration;
