import React, { useMemo, useState, useCallback } from 'react';
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
  Dropdown,
  TableToolbar,
  TableToolbarContent,
  Layer,
  Tile,
  TableToolbarSearch,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';

import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, usePagination, showModal } from '@openmrs/esm-framework';
import styles from './procedure-queue.scss';
import { useOrdersWorklist } from '../hooks/useOrdersWorklist';
import PickProcedureRequestActionMenu from './pick-procedure-request-menu.component';
import ProcedureInstructionsActionMenu from './procedure-instructions/procedure-instructions-menu.component';

interface ProcedurePatientListProps {
  fulfillerStatus: string;
}
interface RejectOrderOverflowMenuItemProps {
  order: any;
}

const RejectOrderMenuItem: React.FC<RejectOrderOverflowMenuItemProps> = ({ order }) => {
  const handleRejectOrderModel = useCallback(() => {
    const dispose = showModal('reject-procedure-order-dialog', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);
  return (
    <OverflowMenuItem
      className={styles.rejectOrders}
      itemText="Reject Order"
      onClick={handleRejectOrderModel}
      hasDivider
    />
  );
};

const ProcedureOrderedList: React.FC<ProcedurePatientListProps> = () => {
  const { t } = useTranslation();

  const OrderStatuses = ['All', 'RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'EXCEPTION', 'ON_HOLD', 'DECLINED'];

  const [filter, setFilter] = useState<
    'All' | 'EXCEPTION' | 'RECEIVED' | 'COMPLETED' | 'IN_PROGRESS' | 'ON_HOLD' | 'DECLINED'
  >('All');

  const { workListEntries, isLoading } = useOrdersWorklist('', '');

  const filteredStatus = useMemo(() => {
    if (!filter || filter == 'All') {
      return workListEntries;
    }

    if (filter) {
      return workListEntries?.filter((order) => order.fulfillerStatus === filter);
    }

    return workListEntries;
  }, [filter, workListEntries]);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const { goTo, results: paginatedWorklistQueueEntries, currentPage } = usePagination(filteredStatus, currentPageSize);
  // get picked orders
  const columns = [
    { id: 0, header: t('date', 'Date'), key: 'date' },
    { id: 1, header: t('orderNumber', 'Procedure Number'), key: 'orderNumber' },
    { id: 2, header: t('patient', 'Patient'), key: 'patient' },
    { id: 3, header: t('procedure', 'Procedure'), key: 'procedure' },
    { id: 4, header: t('urgency', 'Priority'), key: 'urgency' },
    { id: 5, header: t('orderer', 'Orderer'), key: 'orderer' },
    { id: 6, header: t('actions', 'Actions'), key: 'actions' },
  ];

  const handleOrderStatusChange = ({ selectedItem }) => setFilter(selectedItem);

  const tableRows = useMemo(() => {
    return paginatedWorklistQueueEntries
      ?.filter((item) => (item?.fulfillerStatus === null || item?.fulfillerStatus === '') && item?.action === 'NEW')
      .map((entry) => ({
        ...entry,
        id: entry?.uuid,
        date: <span className={styles['single-line-display']}>{formatDate(parseDate(entry?.dateActivated))}</span>,
        patient: entry?.patient?.display.split('-')[1],
        orderNumber: {
          content: (
            <span>
              {entry.orderNumber}
              {entry.numberOfRepeats > 0 ? `(${entry.procedures?.length}/${entry.numberOfRepeats + 1})` : ''}
            </span>
          ),
        },
        procedure: entry?.concept.display,
        priority: entry?.urgency,
        action: entry?.action,
        orderer: entry?.orderer?.display,
        actions: (
          <OverflowMenu flipped={true}>
            <PickProcedureRequestActionMenu closeModal={() => true} order={entry} />
            <ProcedureInstructionsActionMenu order={entry} closeModal={() => true} />
            <RejectOrderMenuItem order={entry} />
          </OverflowMenu>
        ),
      }));
  }, [paginatedWorklistQueueEntries]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (paginatedWorklistQueueEntries?.length >= 0) {
    return (
      <DataTable rows={tableRows} headers={columns} useZebraStyles overflowMenuOnHover={true}>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar
              style={{
                position: 'static',
              }}>
              <TableToolbarContent>
                <Layer style={{ margin: '5px' }}>
                  <Dropdown
                    id="orderStatus"
                    initialSelectedItem={'All'}
                    label=""
                    titleText={t('filterOrdersByStatus', 'Filter Orders by status') + ':'}
                    type="inline"
                    items={OrderStatuses}
                    onChange={handleOrderStatusChange}
                  />
                </Layer>
                <Layer style={{ margin: '5px' }}>
                  <TableToolbarSearch
                    expanded
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
                    <TableHeader {...getHeaderProps({ header })}>{header.header?.content ?? header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
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
                    <p className={styles.content}>{t('noWorklistsToDisplay', 'No procedure orders to display')}</p>
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
    );
  }
};

export default ProcedureOrderedList;
