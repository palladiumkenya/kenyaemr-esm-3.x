import React from 'react';
import { ExtensionSlot, WorkspaceContainer } from '@openmrs/esm-framework';

const Pharmacy = () => {
  return (
    <div>
      <ExtensionSlot name="dispensing-dashboard-slot" />
      <WorkspaceContainer key="dispensing" contextKey="dispensing" />
    </div>
  );
};

export default Pharmacy;
