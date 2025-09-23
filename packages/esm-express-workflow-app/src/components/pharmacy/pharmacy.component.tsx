import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';

const Pharmacy = () => {
  return (
    <div>
      <ExtensionSlot name="dispensing-dashboard-slot" />
    </div>
  );
};

export default Pharmacy;
