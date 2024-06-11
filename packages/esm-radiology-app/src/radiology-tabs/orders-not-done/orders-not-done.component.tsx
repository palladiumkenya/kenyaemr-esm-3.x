import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Information } from '@carbon/react/icons';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTable,
  DataTableSkeleton,
  Pagination,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  Tooltip,
  Layer,
  Tag,
  Tile,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import { useOrdersWorklist } from '../../hooks/useOrdersWorklist';
import { formatDate, parseDate, usePagination, showModal, ConfigurableLink } from '@openmrs/esm-framework';
import { useSearchResults } from '../../hooks/useSearchResults';
import styles from '../test-ordered/tests-ordered.scss';
interface RejectionProps {
  order: Result;
}
import { Result } from '../work-list/work-list.resource';
import { getStatusColor } from '../../utils/functions';
import Overlay from '../../components/overlay/overlay.component';
interface NotDoneProps {
  fulfillerStatus: string;
}
export const OrdersNotDone: React.FC<NotDoneProps> = ({ fulfillerStatus }) => {
  const { t } = useTranslation();
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);
  const { workListEntries, isLoading, mutate } = useOrdersWorklist('', fulfillerStatus);
  const [searchString, setSearchString] = useState<string>('');
  const [activatedOnOrAfterDate, setActivatedOnOrAfterDate] = useState('');
  const searchResults = useSearchResults(workListEntries, searchString);
  const { goTo, results: paginatedResults, currentPage } = usePagination(workListEntries, currentPageSize);

  const pageSizes = [10, 20, 30, 40, 50];

  const tableColums = [
    { id: 0, header: t('date', 'Date'), key: 'date' },
    { id: 1, header: t('orderNumber', 'Order Number'), key: 'orderNumber' },
    { id: 2, header: t('patient', 'Patient'), key: 'patient' },
    { id: 4, header: t('procedure', 'Procedure'), key: 'procedure' },
    { id: 5, header: t('status', 'Status'), key: 'status' },
    {
      id: 6,
      header: t('fulfillerComment', 'Reason Not Done'),
      key: 'fulfillerComment',
    },
    { id: 7, header: t('urgency', 'Urgency'), key: 'urgency' },
    { id: 8, header: t('orderer', 'Orderer'), key: 'orderer' },
  ];

  const rows = useMemo(() => {
    const RejectionReason: React.FC<RejectionProps> = ({ order }) => {
      const launchProcedureRejectionModal = useCallback(() => {
        const dispose = showModal('radiology-reject-reason-modal', {
          closeModal: () => dispose(),
          order,
        });
      }, [order]);
      return (
        <Button
          kind="ghost"
          onClick={launchProcedureRejectionModal}
          renderIcon={(props) => (
            <Tooltip align="top" label="Instructions">
              <Information size={16} {...props} />
            </Tooltip>
          )}
        />
      );
    };

    return paginatedResults
      ?.filter((item) => item.fulfillerStatus === 'DECLINED')
      .map((entry) => ({
        ...entry,
        id: entry.uuid,
        date: <span className={styles['single-line-display']}>{formatDate(parseDate(entry?.dateActivated))}</span>,
        patient: {
          content: (
            <ConfigurableLink to={`\${openmrsSpaBase}/patient/${entry.patient}/chart/laboratory-orders`}>
              {entry.patient.display.split('-')[1]}
            </ConfigurableLink>
          ),
        },
        orderNumber: { content: <span>{entry.orderNumber}</span> },
        procedure: { content: <span>{entry.concept.display}</span> },
        status: {
          content: (
            <>
              <Tag>
                <span className={styles.statusContainer} style={{ color: `${getStatusColor(entry.fulfillerStatus)}` }}>
                  <span>{entry.fulfillerStatus}</span>
                </span>
              </Tag>
            </>
          ),
        },
        orderer: { content: <span>{entry.orderer.display}</span> },
        orderType: { content: <span>{entry?.orderType?.display}</span> },
        priority: { content: <span>{entry.urgency}</span> },
        fulfillerComment: {
          content: (
            <>
              <RejectionReason order={entry} />
            </>
          ),
        },
      }));
  }, [paginatedResults, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (paginatedResults?.length >= 0) {
    return (
      <>
        <div>
          <div className={styles.headerBtnContainer}></div>
          <DataTable rows={rows} headers={tableColums} useZebraStyles>
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
                        <p className={styles.content}>{t('noRadiologiesToDisplay', 'No Radiologies to display')}</p>
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
                      setCurrentPageSize(pageSize);
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
export default OrdersNotDone;
