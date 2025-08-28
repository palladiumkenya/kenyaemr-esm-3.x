import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';

const Procedures: React.FC = () => {
  return (
    <div>
      <ExtensionSlot name="procedures-dashboard-slot" />
    </div>
  );
};

export default Procedures;
