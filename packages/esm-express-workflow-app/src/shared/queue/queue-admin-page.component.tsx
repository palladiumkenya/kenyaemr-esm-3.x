import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';

const QueuesAdminPage = () => {
  return (
    <>
      <div>Testing queue admin</div>
      <ExtensionSlot name="service-queues-admin-page-slot" />
    </>
  );
};

export default QueuesAdminPage;
