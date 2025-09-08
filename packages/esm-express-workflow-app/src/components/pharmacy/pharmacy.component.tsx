import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';

const Pharmacy: React.FC = () => {
  return (
    <div>
      <ExtensionSlot name="express-pharmacy-dashboard-slot" />
    </div>
  );
};

export default Pharmacy;
