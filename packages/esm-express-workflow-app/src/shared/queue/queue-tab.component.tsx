import { Tabs, TabList, Tab, TabPanels, TabPanel, InlineLoading, TabsSkeleton } from '@carbon/react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import startCase from 'lodash-es/startCase';

import Card from '../cards/card.component';
import { Queue } from '../../types/index';
import QueueEntryTable from './queue-entry/queue-entry-table.component';
import { useQueueEntries } from '../../hooks/useServiceQueues';
import styles from './queue-tab.scss';

type QueueTabProps = {
  queues: Array<Queue>;
  cards?: Array<{ title: string; value: string; categories?: Array<{ label: string; value: number }> }>;
  navigatePath: string;
  onTabChanged?: (queue: Queue) => void;
  usePatientChart?: boolean;
};

const QueueTab: React.FC<QueueTabProps> = ({ queues, cards, navigatePath, onTabChanged, usePatientChart }) => {
  const { t } = useTranslation();
  const [selectedQueue, setSelectedQueue] = useState<Queue | undefined>(() => queues[0]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { queueEntries, isLoading, error } = useQueueEntries({
    location: selectedQueue?.location?.uuid ? [selectedQueue.location.uuid] : undefined,
  });

  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  const queueEntriesByService = useMemo(() => {
    if (!queueEntries?.length || !selectedQueue?.service?.uuid) {
      return [];
    }

    return queueEntries.filter((entry) => entry?.queue?.service?.uuid === selectedQueue.service.uuid);
  }, [queueEntries, selectedQueue?.service?.uuid]);

  const handleQueueSelection = useCallback(
    (queue: Queue) => {
      setSelectedQueue(queue);
      onTabChanged?.(queue);
    },
    [onTabChanged],
  );

  if (isInitialLoad && isLoading) {
    return <TabsSkeleton />;
  }

  if (!queues || queues.length === 0) {
    return <div>{t('noQueuesAvailable', 'No queues available')}</div>;
  }

  if (!selectedQueue) {
    return <div>{t('noQueueSelected', 'Please select a queue')}</div>;
  }

  if (error) {
    return <div>{t('errorLoadingQueueEntries', 'Error loading queue entries')}</div>;
  }

  return (
    <div className={styles.queueTab}>
      <div className={styles.cards}>
        {cards?.map((card) => (
          <Card key={card.title} title={card.title} total={card.value} categories={card.categories} />
        ))}
      </div>
      <div className={styles.tabsContainer}>
        <Tabs>
          <TabList contained>
            {queues.map((queue) => (
              <Tab key={queue.uuid} onClick={() => handleQueueSelection(queue)}>
                {startCase(queue.location.display)}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {queues.map((queue) => (
              <TabPanel key={queue.uuid}>
                {selectedQueue?.uuid === queue.uuid && (
                  <div key={`${queue.uuid}-${isLoading}`}>
                    {isLoading && !isInitialLoad && (
                      <div className={styles.loadingOverlay}>
                        <InlineLoading description={t('loadingQueueEntries', 'Loading queue entries...')} />
                      </div>
                    )}
                    <QueueEntryTable
                      queueEntries={queueEntriesByService}
                      key={`table-${queue.uuid}`}
                      navigatePath={navigatePath}
                      usePatientChart={usePatientChart}
                    />
                  </div>
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default QueueTab;
