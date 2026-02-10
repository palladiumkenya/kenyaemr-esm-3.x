import React, { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Tabs, TabList, Tab, TabPanels, TabPanel, InlineLoading, TabsSkeleton } from '@carbon/react';
import startCase from 'lodash-es/startCase';

import FiltersHeader from './filters-header.component';
import { type Queue, type QueueFilter } from '../../types/index';
import { useQueueEntries } from '../../hooks/useServiceQueues';
import QueueEntryTable from './queue-entry/queue-entry-table.component';
import styles from './queue-tab.scss';

type QueueTabProps = {
  queues: Array<Queue>;
  navigatePath: string;
  onTabChanged?: (queue: Queue) => void;
  usePatientChart?: boolean;
  filters?: Array<QueueFilter>;
  onFiltersChanged?: (filters: Array<QueueFilter>) => void;
};

const startedOnOrAfter = dayjs().subtract(24, 'hour').format('YYYY-MM-DD HH:mm:ss');

const QueueTab: React.FC<QueueTabProps> = ({
  queues,
  navigatePath,
  onTabChanged,
  usePatientChart,
  filters,
  onFiltersChanged,
}) => {
  const { t } = useTranslation();

  // Filter queues with rooms first
  const [pageSize, setPageSize] = useState(100);
  const validQueues = useMemo(() => queues.filter((queue) => queue?.queueRooms?.length > 0), [queues]);

  // Set initial selected queue to first valid queue
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const selectedQueue = validQueues[selectedTabIndex];

  const {
    queueEntries,
    isLoading: isLoadingQueueEntries,
    isValidating: isValidatingQueueEntries,
    error,
    pagination,
  } = useQueueEntries(
    {
      location: selectedQueue?.location?.uuid ? [selectedQueue.location.uuid] : undefined,
      startedOnOrAfter: startedOnOrAfter,
    },
    pageSize,
  );

  const queueEntriesByService = useMemo(() => {
    if (!queueEntries?.length || !selectedQueue?.uuid) {
      return [];
    }
    const priorityFilter = filters?.find((filter) => filter.key === 'priority')?.value;
    const statusFilter =
      filters?.filter((filter) => filter.key === 'status')?.flatMap((filter) => filter.value.split(',')) ?? [];
    const serviceAwaitingFilter = filters?.find((filter) => filter.key === 'service_awaiting')?.value?.split(',') ?? []; // Patient UUIDs
    const serviceCompletedFilter =
      filters?.find((filter) => filter.key === 'service_completed')?.value?.split(',') ?? []; // Patient UUIDs
    const filtered = queueEntries.filter((entry) => {
      return (
        entry?.queue?.uuid === selectedQueue?.uuid &&
        (statusFilter.length > 0 ? statusFilter.includes(entry?.status?.uuid) : true) &&
        (priorityFilter ? entry?.priority?.uuid === priorityFilter : true) &&
        (serviceAwaitingFilter.length > 0 ? serviceAwaitingFilter.includes(entry?.patient?.uuid) : true) &&
        (serviceCompletedFilter.length > 0 ? serviceCompletedFilter.includes(entry?.patient?.uuid) : true)
      );
    });
    return filtered;
  }, [filters, queueEntries?.length, selectedQueue?.uuid]);

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

  const isLoading = isLoadingQueueEntries && !isValidatingQueueEntries;

  if (isLoading) {
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
                {isLoading && (
                  <div className={styles.loadingOverlay}>
                    <InlineLoading description={t('loadingQueueEntries', 'Loading queue entries...')} />
                  </div>
                )}
                <QueueEntryTable
                  queueEntries={queueEntriesByService}
                  navigatePath={navigatePath}
                  usePatientChart={usePatientChart}
                  pagination={pagination}
                  onPageSizeChange={(pageSize) => {
                    setPageSize(pageSize as number);
                  }}
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
