import React, { useState } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
  Search,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink, showModal, useConfig, useDebounce, usePagination } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import startCase from 'lodash-es/startCase';

import styles from './queue-entry-table.scss';
import { spaBasePath } from '../../../constants';
import { type QueueEntry } from '../../../types/index';
import { serveQueueEntry } from '../../../hooks/useServiceQueues';
import lowerCase from 'lodash-es/lowerCase';
import capitalize from 'lodash-es/capitalize';
import { type ExpressWorkflowConfig } from '../../../config-schema';

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

type QueueEntryTableProps = {
  navigatePath?: string;
  queueEntries: Array<QueueEntry>;
  usePatientChart?: boolean;
};

const QueueEntryTable: React.FC<QueueEntryTableProps> = ({
  navigatePath = 'triage',
  queueEntries,
  usePatientChart,
}) => {
  const { visitQueueNumberAttributeUuid } = useConfig<ExpressWorkflowConfig>();
  const [searchString, setSearchString] = useState('');
  const pageSize = 10;
  const { t } = useTranslation();
  const debouncedSearchString = useDebounce(searchString, 500);
  const { currentPage, goTo, results } = usePagination(
    queueEntries.filter((queueEntry) => {
      return queueEntry.patient.person.display.toLowerCase().includes(debouncedSearchString.toLowerCase());
    }),
    pageSize,
  );
  const { pageSizes } = usePaginationInfo(pageSize, queueEntries.length, currentPage, results.length);

  const headers = [
    {
      header: t('name', 'Name'),
      key: 'patientName',
    },
    {
      header: t('queueNumber', 'Queue Number'),
      key: 'queueNumber',
    },
    {
      header: t('comingFrom', 'Coming from'),
      key: 'previousQueue',
    },
    {
      header: t('priority', 'Priority'),
      key: 'priority',
    },
    {
      header: t('status', 'status'),
      key: 'status',
    },
    {
      header: t('queue', 'Queue'),
      key: 'queue',
    },
    {
      header: t('waitTime', 'Wait time'),
      key: 'waitTime',
    },
  ];

  const handleCallQueueEntry = async (queueEntry: QueueEntry) => {
    const queueNumber = queueEntry.visit.attributes?.filter(
      (attr) => attr['attributeType']?.uuid === visitQueueNumberAttributeUuid,
    )?.[0];
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

  const rows = results?.map((queueEntry) => {
    const visitNumber = queueEntry?.visit?.attributes?.find(
      (attr) => attr?.attributeType?.uuid === visitQueueNumberAttributeUuid,
    );

    const patientChartUrl = usePatientChart
      ? `${window.spaBase}/patient/${queueEntry.patient.uuid}/chart/Patient Summary?path=${navigatePath}`
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
        <div className={styles.priorityPill} data-priority={lowerCase(queueEntry.priority.display)}>
          {t(queueEntry.priority.display, capitalize(queueEntry.priority.display.replace('_', ' ')))}
        </div>
      ),
      status: queueEntry?.status?.display ?? '--',
      queue: startCase(queueEntry?.queue?.display?.toLowerCase() ?? '--'),
      waitTime: dayjs(queueEntry.startedAt).fromNow(),
    };
  });

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
                        onClick={() => handleCallQueueEntry(results[index])}
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
      <Pagination
        pageSizes={pageSizes}
        forwardText={t('nextPage', 'Next page')}
        backwardText={t('previousPage', 'Previous page')}
        page={currentPage}
        pageSize={pageSize}
        totalItems={queueEntries.length}
        onChange={({ page }) => {
          goTo(page);
        }}
      />
    </div>
  );
};

export default QueueEntryTable;
