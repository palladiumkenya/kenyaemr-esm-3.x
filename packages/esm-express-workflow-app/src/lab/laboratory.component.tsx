import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';

const Laboratory: React.FC = () => {
  return (
    <div>
      {/* This slot will host the laboratory app */}
      <ExtensionSlot name="laboratory-dashboard-slot" />
    </div>
  );
};

export default Laboratory;
