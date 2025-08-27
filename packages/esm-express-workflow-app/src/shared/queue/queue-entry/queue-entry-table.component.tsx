import React from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
  Pagination,
} from '@carbon/react';
import { useQueueEntries } from '../../../hooks/useServiceQueues';
import { useTranslation } from 'react-i18next';
import { age, ConfigurableLink, formatDatetime, parseDate, usePagination } from '@openmrs/esm-framework';
import styles from './queue-entry-table.scss';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { spaBasePath } from '../../../constants';
import { Queue } from '../../../types/index';

type QueueEntryTableProps = {
  navigatePath?: string;
  queue: Queue | null;
};

const QueueEntryTable: React.FC<QueueEntryTableProps> = ({ navigatePath = 'triage', queue }) => {
  const { t } = useTranslation();
  const { queueEntries, isLoading, error } = useQueueEntries();
  const pageSize = 10;
  const { currentPage, goTo, results } = usePagination(queueEntries, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, queueEntries.length, currentPage, results.length);

  const headers = [
    {
      header: t('visitTime', 'Visit Time'),
      key: 'visitTime',
    },
    {
      header: t('identifier', 'Identifier'),
      key: 'identifier',
    },
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('gender', 'Gender'),
      key: 'gender',
    },
    {
      header: t('age', 'Age'),
      key: 'age',
    },
    {
      header: t('priority', 'Priority'),
      key: 'priority',
    },
  ];

  const rows = queueEntries.map((queueEntry) => ({
    id: queueEntry.uuid,
    visitTime: formatDatetime(parseDate(queueEntry.visit.startDatetime), { mode: 'standard' }),
    identifier: queueEntry.patient.identifiers?.[0]?.identifier,
    name: (
      <ConfigurableLink className={styles.link} to={`${spaBasePath}/${navigatePath}/${queueEntry.patient.uuid}`}>
        {queueEntry.patient.person.display}
      </ConfigurableLink>
    ),
    gender: queueEntry.patient.person.gender,
    age: age(queueEntry.patient.person.birthdate),
    priority: queueEntry.priority.name.display,
  }));

  if (isLoading) {
    return <DataTableSkeleton aria-label={t('queueEntries', 'Queue Entries')} />;
  }

  return (
    <div className={styles.table}>
      <DataTable rows={rows} headers={headers} size="sm" useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
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
        onChange={({ page, pageSize }) => {
          goTo(page);
        }}
      />
    </div>
  );
};

export default QueueEntryTable;
