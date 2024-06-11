import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Layer,
  Tag,
  Tile,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import styles from './completed-list.scss';
import { ConfigurableLink, formatDate, parseDate, usePagination } from '@openmrs/esm-framework';
import { getStatusColor } from '../utils/functions';
import Overlay from '../components/overlay/overlay.component';
import { useOrdersWorklist } from '../hooks/useOrdersWorklist';

interface CompletedListProps {
  fulfillerStatus: string;
}

export const CompletedList: React.FC<CompletedListProps> = ({ fulfillerStatus }) => {
  const { t } = useTranslation();

  const { workListEntries, isLoading } = useOrdersWorklist('', fulfillerStatus);
  const [activatedOnOrAfterDate, setActivatedOnOrAfterDate] = useState('');
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const { goTo, results: paginatedWorkListEntries, currentPage } = usePagination(workListEntries, currentPageSize);

  // get picked orders
  const columns = [
    { id: 0, header: t('date', 'Date'), key: 'date' },
    { id: 1, header: t('orderNumber', 'Order Number'), key: 'orderNumber' },
    { id: 2, header: t('patient', 'Patient'), key: 'patient' },
    { id: 3, header: t('procedure', 'Procedure'), key: 'procedure' },
    { id: 4, header: t('status', 'Status'), key: 'status' },
    { id: 5, header: t('urgency', 'Priority'), key: 'urgency' },
    { id: 6, header: t('orderer', 'Orderer'), key: 'orderer' },
    { id: 7, header: t('actions', 'Actions'), key: 'actions' },
  ];

  const tableRows = useMemo(() => {
    return paginatedWorkListEntries
      ?.filter((item) => item.fulfillerStatus === 'COMPLETED')
      .map((entry, index) => ({
        ...entry,
        id: entry.uuid,
        date: {
          content: (
            <>
              <span>{formatDate(parseDate(entry.dateActivated))}</span>
            </>
          ),
        },
        patient: {
          content: (
            <ConfigurableLink to={`\${openmrsSpaBase}/patient/${entry.patient.uuid}/chart/laboratory-orders`}>
              {entry.patient.display.split('-')[1]}
            </ConfigurableLink>
          ),
        },
        orderNumber: { content: <span>{entry.orderNumber}</span> },
        procedure: { content: <span>{entry.concept.display}</span> },
        action: { content: <span>{entry.action}</span> },
        status: {
          content: (
            <>
              <Tag>
                <span className={styles.statusContainer} style={{ color: `${getStatusColor('COMPLETED')}` }}>
                  <span>Completed</span>
                </span>
              </Tag>
            </>
          ),
        },
        orderer: { content: <span>{entry.orderer.display}</span> },
        orderType: { content: <span>{entry?.orderType?.display}</span> },
        priority: { content: <span>{entry.urgency}</span> },
        actions: '--',
      }));
  }, [paginatedWorkListEntries, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (paginatedWorkListEntries?.length >= 0) {
    return (
      <>
        <div>
          <div className={styles.headerBtnContainer}></div>
          <DataTable rows={tableRows} headers={columns} useZebraStyles>
            {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
              <TableContainer className={styles.tableContainer}>
                <TableToolbar
                  style={{
                    position: 'static',
                  }}>
                  <TableToolbarContent>
                    <Layer style={{ margin: '5px' }}>
                      <DatePicker dateFormat="Y-m-d" datePickerType="single">
                        <DatePickerInput
                          labelText={''}
                          id="activatedOnOrAfterDate"
                          placeholder="YYYY-MM-DD"
                          onChange={(event) => {
                            setActivatedOnOrAfterDate(event.target.value);
                          }}
                          type="date"
                          value={activatedOnOrAfterDate}
                        />
                      </DatePicker>
                    </Layer>
                    <Layer>
                      <TableToolbarSearch
                        onChange={onInputChange}
                        placeholder={t('searchThisList', 'Search this list')}
                        size="sm"
                      />
                    </Layer>
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()} className={styles.activePatientsTable}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })}>
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => {
                      return (
                        <React.Fragment key={row.id}>
                          <TableRow {...getRowProps({ row })} key={row.id}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                            ))}
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
                {rows.length === 0 ? (
                  <div className={styles.tileContainer}>
                    <Tile className={styles.tile}>
                      <div className={styles.tileContent}>
                        <p className={styles.content}>
                          {t('noWorklistsToDisplay', 'No worklists procedures to display')}
                        </p>
                      </div>
                    </Tile>
                  </div>
                ) : null}
                <Pagination
                  forwardText="Next page"
                  backwardText="Previous page"
                  page={currentPage}
                  pageSize={currentPageSize}
                  pageSizes={pageSizes}
                  totalItems={workListEntries?.length}
                  className={styles.pagination}
                  onChange={({ pageSize, page }) => {
                    if (pageSize !== currentPageSize) {
                      setPageSize(pageSize);
                    }
                    if (page !== currentPage) {
                      goTo(page);
                    }
                  }}
                />
              </TableContainer>
            )}
          </DataTable>
        </div>
        <Overlay />
      </>
    );
  }
};
