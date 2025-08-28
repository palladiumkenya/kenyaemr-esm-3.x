import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';

const Accounting: React.FC = () => {
  return <ExtensionSlot name="accounting-dashboard-slot" />;
};

export default Accounting;
