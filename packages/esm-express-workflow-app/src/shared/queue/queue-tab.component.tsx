import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import React, { useState } from 'react';
import styles from './queue-tab.scss';
import { Queue } from '../../types/index';
import QueueEntryTable from './queue-entry/queue-entry-table.component';

type QueueTabProps = {
  queues: Array<Queue>;
};

const QueueTab: React.FC<QueueTabProps> = ({ queues }) => {
  const [selectedQueue, setSelectedQueue] = useState<Queue | undefined>(queues[0]);
  return (
    <div className={styles.queueTab}>
      <Tabs>
        <TabList contained>
          {queues.map((queue) => (
            <Tab key={queue.uuid} onClick={() => setSelectedQueue(queue)}>
              {`${queue.name} (${queue.location.display})`}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {queues.map((queue) => (
            <TabPanel key={queue.uuid}>
              <QueueEntryTable queue={selectedQueue} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default QueueTab;
