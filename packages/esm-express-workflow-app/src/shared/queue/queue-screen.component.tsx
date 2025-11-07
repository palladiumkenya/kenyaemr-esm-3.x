import React from 'react';
import { ExtensionSlot, WorkspaceContainer } from '@openmrs/esm-framework';

import styles from './queue-admin-page.scss';

const QueueScreen = () => {
  return (
    <div className={styles.container}>
      <ExtensionSlot name="queue-screen-slot" />
      <WorkspaceContainer key="queues-admin" contextKey="queues-admin" overlay />
    </div>
  );
};

export default QueueScreen;
