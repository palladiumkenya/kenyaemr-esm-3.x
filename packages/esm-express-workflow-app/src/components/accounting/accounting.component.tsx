import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';

const Accounting: React.FC = () => {
  return (
    <div>
      <ExtensionSlot name="accounting-slot" />
    </div>
  );
};

export default Accounting;
