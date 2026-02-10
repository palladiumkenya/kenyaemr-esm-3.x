import {
  DataTable,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { ConfigurableLink, showModal, useConfig, useDebounce } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import startCase from 'lodash-es/startCase';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import capitalize from 'lodash-es/capitalize';
import lowerCase from 'lodash-es/lowerCase';
import { type ExpressWorkflowConfig } from '../../../config-schema';
import { spaBasePath } from '../../../constants';
import { serveQueueEntry } from '../../../hooks/useServiceQueues';
import { type QueueEntriesPagination, type QueueEntry } from '../../../types/index';
import styles from './queue-entry-table.scss';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib/src';

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

type QueueEntryTableProps = {
  navigatePath?: string;
  queueEntries: Array<QueueEntry>;
  usePatientChart?: boolean;
  pagination?: QueueEntriesPagination;
  onPageSizeChange?: (pageSize: number) => void;
};

const QueueEntryTable: React.FC<QueueEntryTableProps> = ({
  navigatePath = 'triage',
  queueEntries,
  usePatientChart,
  pagination,
  onPageSizeChange,
}) => {
  const { visitQueueNumberAttributeUuid } = useConfig<ExpressWorkflowConfig>();
  const [searchString, setSearchString] = useState('');
  const { t } = useTranslation();
  const debouncedSearchString = useDebounce(searchString, 500);
  const filteredQueueEntries = useMemo(() => {
    return queueEntries.filter((queueEntry) => {
      return queueEntry.patient.person.display.toLowerCase().includes(debouncedSearchString.toLowerCase());
    });
  }, [queueEntries, debouncedSearchString]);

  const { pageSizes } = usePaginationInfo(
    pagination.currentPageSize.current,
    pagination.totalCount,
    pagination.currentPage,
    filteredQueueEntries.length,
  );

  const headers = useMemo(
    () => [
      { header: t('name', 'Name'), key: 'patientName' },
      { header: t('queueNumber', 'Queue Number'), key: 'queueNumber' },
      { header: t('comingFrom', 'Coming from'), key: 'previousQueue' },
      { header: t('priority', 'Priority'), key: 'priority' },
      { header: t('priorityComment', 'Priority Comment'), key: 'priorityComment' },
      { header: t('status', 'status'), key: 'status' },
      { header: t('queue', 'Queue'), key: 'queue' },
      { header: t('waitTime', 'Wait time'), key: 'waitTime' },
    ],
    [t],
  );

  const handleCallQueueEntry = async (queueEntry: QueueEntry) => {
    const queueNumber = queueEntry.visit.attributes?.find(
      (attr) => attr['attributeType']?.uuid === visitQueueNumberAttributeUuid,
    );
    const response = await serveQueueEntry(
      queueEntry.queue.name,
      queueNumber.value,
      'calling',
      queueEntry?.queue?.location?.uuid,
    );
    if (response.ok) {
      const dispose = showModal('call-queue-entry-modal', {
        closeModal: () => dispose(),
        queueEntry,
        size: 'sm',
      });
    }
  };

  const rows = useMemo(() => {
    return filteredQueueEntries?.map((queueEntry) => {
      const visitNumber = queueEntry?.visit?.attributes?.find(
        (attr) => attr?.attributeType?.uuid === visitQueueNumberAttributeUuid,
      );

      const patientChartUrl = usePatientChart
        ? `${globalThis.spaBase}/patient/${queueEntry.patient.uuid}/chart/Patient Summary?path=${navigatePath}`
        : `${spaBasePath}/${navigatePath}/${queueEntry.patient.uuid}`;

      return {
        id: queueEntry.uuid,
        queueNumber: visitNumber?.value ?? '--',
        previousQueue: startCase(queueEntry.previousQueueEntry?.queue?.display?.toLowerCase() ?? '--'),
        patientName: (
          <ConfigurableLink className={styles.link} to={patientChartUrl}>
            {startCase(queueEntry.patient.person.display.toLowerCase())}
          </ConfigurableLink>
        ),
        priority: (
          <div className={styles.priorityPill} data-priority={lowerCase(queueEntry?.priority?.display)}>
            {t(queueEntry?.priority?.display, capitalize(queueEntry?.priority?.display.replace('_', ' ')))}
          </div>
        ),
        priorityComment: startCase(queueEntry.priorityComment?.toLowerCase() ?? '--'),
        status: queueEntry?.status?.display ?? '--',
        queue: startCase(queueEntry?.queue?.display?.toLowerCase() ?? '--'),
        waitTime: dayjs(queueEntry.startedAt).fromNow(),
      };
    });
  }, [filteredQueueEntries, visitQueueNumberAttributeUuid, navigatePath, usePatientChart, t]);

  if (queueEntries.length === 0) {
    return <div>{t('noPatientsAwaiting', 'No patients awaiting service')}</div>;
  }

  return (
    <div className={styles.table}>
      <Search
        labelText={t('search', 'Search')}
        placeholder={t('search', 'Search')}
        value={searchString}
        onChange={({ target: { value } }) => {
          setSearchString(value);
        }}
      />
      <DataTable size="sm" useZebraStyles rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getCellProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
                <TableHeader aria-label="queue entry actions" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell {...getCellProps({ cell })}>{cell.value}</TableCell>
                  ))}
                  <TableCell className="cds--table-column-menu">
                    <OverflowMenu size="sm" aria-label="overflow-menu" flipped align="right">
                      <OverflowMenuItem
                        onClick={() => handleCallQueueEntry(filteredQueueEntries[index])}
                        itemText={t('call', 'Call')}
                      />
                    </OverflowMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      {pagination && (
        <Pagination
          pageSizes={pageSizes}
          forwardText={t('nextPage', 'Next page')}
          backwardText={t('previousPage', 'Previous page')}
          page={pagination.currentPage}
          pageSize={pagination.currentPageSize.current}
          totalItems={pagination.totalCount}
          onChange={({ page, pageSize }) => {
            pagination.goTo(page);
            onPageSizeChange?.(pageSize as number);
          }}
        />
      )}
    </div>
  );
};

export default QueueEntryTable;
