import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';

const Laboratory: React.FC = () => {
  return (
    <div>
      <ExtensionSlot name="express-laboratory-dashboard-slot" />
    </div>
  );
};

export default Laboratory;
