import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';

const Radiology: React.FC = () => {
  return (
    <div>
      <ExtensionSlot name="express-radiology-dashboard-slot" />
    </div>
  );
};

export default Radiology;
