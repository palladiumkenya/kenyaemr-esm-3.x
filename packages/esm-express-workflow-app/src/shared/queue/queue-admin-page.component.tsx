import React from 'react';
import { ExtensionSlot, WorkspaceContainer } from '@openmrs/esm-framework';

import styles from './queue-admin-page.scss';

const QueuesAdminPage = () => {
  return (
    <div className={styles.container}>
      <ExtensionSlot name="service-queues-admin-page-slot" />
      <WorkspaceContainer key="queues-admin" contextKey="queues-admin" overlay />
    </div>
  );
};

export default QueuesAdminPage;
