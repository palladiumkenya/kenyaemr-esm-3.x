import { Tabs, TabList, Tab, TabPanels, TabPanel, InlineLoading, TabsSkeleton } from '@carbon/react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import startCase from 'lodash-es/startCase';
import Card from '../cards/card.component';
import { Queue, QueueFilter } from '../../types/index';
import QueueEntryTable from './queue-entry/queue-entry-table.component';
import { useQueueEntries } from '../../hooks/useServiceQueues';
import styles from './queue-tab.scss';
import FiltersHeader from './filters-header.component';

type QueueTabProps = {
  queues: Array<Queue>;
  cards?: Array<{
    title: string;
    value: string;
    categories?: Array<{ label: string; value: number; onClick?: () => void }>;
    onClick?: () => void;
    refreshButton?: React.ReactNode; // Add this property
  }>;
  navigatePath: string;
  onTabChanged?: (queue: Queue) => void;
  usePatientChart?: boolean;
  filters?: Array<QueueFilter>;
  onFiltersChanged?: (filters: Array<QueueFilter>) => void;
};

const QueueTab: React.FC<QueueTabProps> = ({
  queues,
  cards,
  navigatePath,
  onTabChanged,
  usePatientChart,
  filters,
  onFiltersChanged,
}) => {
  const { t } = useTranslation();

  // Filter queues with rooms first
  const validQueues = useMemo(() => queues.filter((queue) => queue?.queueRooms?.length > 0), [queues]);

  // Set initial selected queue to first valid queue
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const selectedQueue = validQueues[selectedTabIndex];

  const { queueEntries, isLoading, error } = useQueueEntries({
    location: selectedQueue?.location?.uuid ? [selectedQueue.location.uuid] : undefined,
    statuses: filters?.filter((filter) => filter.key === 'status')?.map((filter) => filter.value),
  });

  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  const queueEntriesByService = useMemo(() => {
    if (!queueEntries?.length || !selectedQueue?.uuid) {
      return [];
    }
    const priorityFilter = filters?.find((filter) => filter.key === 'priority')?.value;

    const filtered = queueEntries.filter(
      (entry) =>
        entry?.queue?.uuid === selectedQueue.uuid && (priorityFilter ? entry?.priority?.uuid === priorityFilter : true),
    );
    return filtered;
  }, [filters, queueEntries, selectedQueue.uuid]);

  const handleTabChange = useCallback(
    (evt: { selectedIndex: number }) => {
      setSelectedTabIndex(evt.selectedIndex);
      const newQueue = validQueues[evt.selectedIndex];
      if (newQueue) {
        onTabChanged?.(newQueue);
      }
    },
    [validQueues, onTabChanged],
  );

  if (isInitialLoad && isLoading) {
    return <TabsSkeleton />;
  }

  if (!queues || queues.length === 0) {
    return <div>{t('noQueuesAvailable', 'No queues available')}</div>;
  }

  if (validQueues.length === 0) {
    return <div>{t('noQueueRooms', 'No queue rooms configured')}</div>;
  }

  if (!selectedQueue) {
    return <div>{t('noQueueSelected', 'Please select a queue')}</div>;
  }

  if (error) {
    return (
      <div>
        {t('errorLoadingQueueEntries', 'Error loading queue entries')}: {error.message}
      </div>
    );
  }

  return (
    <div className={styles.queueTab}>
      <div className={styles.cards}>
        {cards?.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            total={card.value}
            categories={card.categories}
            onClick={card.onClick}
            refreshButton={card.refreshButton}
          />
        ))}
      </div>
      <FiltersHeader filters={filters} onFiltersChanged={onFiltersChanged} />
      <div className={styles.tabsContainer}>
        <Tabs selectedIndex={selectedTabIndex} onChange={handleTabChange}>
          <TabList contained>
            {validQueues.map((queue) => (
              <Tab key={queue?.uuid}>{startCase(queue?.queueRooms[0]?.display)}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {validQueues.map((queue, index) => (
              <TabPanel key={queue?.uuid}>
                {isLoading && !isInitialLoad && (
                  <div className={styles.loadingOverlay}>
                    <InlineLoading description={t('loadingQueueEntries', 'Loading queue entries...')} />
                  </div>
                )}
                <QueueEntryTable
                  queueEntries={queueEntriesByService}
                  navigatePath={navigatePath}
                  usePatientChart={usePatientChart}
                />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default QueueTab;
