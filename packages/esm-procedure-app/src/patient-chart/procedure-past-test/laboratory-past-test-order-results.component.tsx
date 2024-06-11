import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './laboratory-past-test-order-results.scss';
import { formatDate, parseDate, ErrorState, showModal, useConfig, usePagination } from '@openmrs/esm-framework';

import {
  DataTable,
  DataTableSkeleton,
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
  Tooltip,
  Pagination,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Button,
  IconButton,
  InlineLoading,
} from '@carbon/react';

import { Printer, MailAll, Add, Checkmark, SendAlt, NotSent } from '@carbon/react/icons';

import TestsResults from '../results-summary/test-results-table.component';
import { useReactToPrint } from 'react-to-print';
import PrintResultsSummary from '../results-summary/print-results-summary.component';
import { useGetPatientByUuid } from '../../utils/functions';
import { ResourceRepresentation, Result, getOrderColor } from '../patient-procedure-order-results.resource';
import { useLaboratoryOrderResultsPages } from '../patient-procedure-order-results-table.resource';
import { CardHeader } from '@openmrs/esm-patient-common-lib';

interface LaboratoryPastTestOrderResultsProps {
  patientUuid: string;
}

interface PrintProps {
  encounter: Result;
}

const LaboratoryPastTestOrderResults: React.FC<LaboratoryPastTestOrderResultsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const { enableSendingLabTestsByEmail, laboratoryEncounterTypeUuid } = useConfig();

  const displayText = t('pastLaboratoryTestsDisplayTextTitle', 'Past Laboratory Tests');
  const { items, tableHeaders, isLoading, isError } = useLaboratoryOrderResultsPages({
    v: ResourceRepresentation.Full,
    totalCount: true,
    patientUuid: patientUuid,
    laboratoryEncounterTypeUuid: laboratoryEncounterTypeUuid,
  });
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const sortedLabRequests = useMemo(() => {
    return [...items]
      ?.filter((item) => item?.encounterType?.uuid === laboratoryEncounterTypeUuid)
      ?.sort((a, b) => {
        const dateA = new Date(a.encounterDatetime);
        const dateB = new Date(b.encounterDatetime);
        return dateB.getTime() - dateA.getTime();
      });
  }, [items, laboratoryEncounterTypeUuid]);

  const [searchTerm, setSearchTerm] = useState('');
  const [laboratoryOrders, setLaboratoryOrders] = useState(sortedLabRequests);
  const [initialTests, setInitialTests] = useState(sortedLabRequests);

  const handleChange = useCallback((event) => {
    const searchText = event?.target?.value?.trim().toLowerCase();
    setSearchTerm(searchText);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setLaboratoryOrders(initialTests);
    } else {
      const filteredItems = initialTests.filter((item) =>
        item?.orders?.some((order) => order?.concept?.display.toLowerCase().includes(searchTerm)),
      );
      setLaboratoryOrders(filteredItems);
    }
  }, [searchTerm, initialTests]);

  useEffect(() => {
    setInitialTests(sortedLabRequests);
  }, [sortedLabRequests]);

  const oneDayBeforeDate = new Date();
  oneDayBeforeDate.setDate(oneDayBeforeDate.getDate() - 1);

  const EmailButtonAction: React.FC = () => {
    const launchSendEmailModal = useCallback(() => {
      const dispose = showModal('send-email-dialog', {
        closeModal: () => dispose(),
      });
    }, []);

    return (
      <Button
        kind="ghost"
        size="sm"
        onClick={(e) => launchSendEmailModal()}
        renderIcon={(props) => <MailAll size={16} {...props} />}
      />
    );
  };

  const LaunchLabRequestForm: React.FC = () => {
    return (
      <IconButton label="Add">
        <Add />
      </IconButton>
    );
  };
  const PrintButtonAction: React.FC<PrintProps> = ({ encounter }) => {
    const { patient } = useGetPatientByUuid(encounter.patient.uuid);

    const [isPrinting, setIsPrinting] = useState(false);

    const contentToPrintRef = useRef(null);

    const onBeforeGetContentResolve = useRef(null);

    useEffect(() => {
      if (onBeforeGetContentResolve.current) {
        onBeforeGetContentResolve.current();
      }
    }, [isPrinting]);

    const handlePrint = useReactToPrint({
      content: () => contentToPrintRef.current,
      onBeforeGetContent: () =>
        new Promise((resolve) => {
          onBeforeGetContentResolve.current = resolve;
          setIsPrinting(true);
        }),
      onAfterPrint: () => {
        onBeforeGetContentResolve.current = null;
        setIsPrinting(false);
      },
    });

    return (
      <div>
        <div ref={contentToPrintRef}>
          <PrintResultsSummary encounterResponse={encounter} patient={patient} />
        </div>
        <Tooltip align="bottom" label="Print out results">
          <Button
            kind="ghost"
            size="sm"
            onClick={handlePrint}
            renderIcon={(props) => <Printer size={16} {...props} />}
          />
        </Tooltip>
      </div>
    );
  };

  const currentDateTime = new Date().getTime();
  const twentyFourHoursAgo = currentDateTime - 24 * 60 * 60 * 1000;

  const filteredPastTestOrderResults = useMemo(() => {
    return laboratoryOrders?.filter((entry) => {
      const entryDate = new Date(entry.encounterDatetime).getTime();
      return entryDate < twentyFourHoursAgo;
    });
  }, [laboratoryOrders, twentyFourHoursAgo]);
  const {
    goTo,
    results: paginatedPastTestOrderResults,
    currentPage,
  } = usePagination(filteredPastTestOrderResults, currentPageSize);

  const tableRows = useMemo(() => {
    return paginatedPastTestOrderResults?.map((entry, index) => ({
      ...entry,
      id: entry?.uuid,
      orderDate: formatDate(parseDate(entry.encounterDatetime), {
        mode: 'standard',
        time: true,
      }),
      orders: (
        <>
          {entry?.orders
            ?.filter((order) => order?.type === 'testorder' && order?.action === 'NEW')
            .map((order) => (
              <Tag
                style={{
                  background: `${getOrderColor(order?.dateActivated, order?.dateStopped)}`,
                  color: 'white',
                }}
                role="tooltip"
                key={order?.uuid}>
                {order?.display}
              </Tag>
            ))}
        </>
      ),
      location: entry?.location?.display,
      status: '--',
      actions: (
        <div style={{ display: 'flex' }}>
          <PrintButtonAction encounter={entry} />
          {enableSendingLabTestsByEmail && <EmailButtonAction />}
        </div>
      ),
    }));
  }, [enableSendingLabTestsByEmail, paginatedPastTestOrderResults]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (isError) {
    return <ErrorState error={isError} headerTitle={'Error'} />;
  }

  if (filteredPastTestOrderResults?.length >= 0) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={displayText}>
          {isLoading ? (
            <span>
              <InlineLoading />
            </span>
          ) : null}
        </CardHeader>
        <DataTable rows={tableRows} headers={tableHeaders} useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                style={{
                  position: 'static',
                  height: '3rem',
                  overflow: 'visible',
                  backgroundColor: 'color',
                }}>
                <TableToolbarContent>
                  <div
                    style={{
                      fontSize: '10px',
                      margin: '5px',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    Key:
                    <Tag
                      size="sm"
                      style={{
                        background: '#6F6F6F',
                        color: 'white',
                      }}
                      title="Result Requested"
                      renderIcon={() => <SendAlt />}>
                      {'Requested'}
                    </Tag>
                    <Tag
                      size="sm"
                      style={{
                        background: 'green',
                        color: 'white',
                      }}
                      title="Result Complete"
                      renderIcon={() => <Checkmark />}>
                      {'Completed'}
                    </Tag>
                    <Tag
                      size="sm"
                      style={{
                        background: 'red',
                        color: 'white',
                      }}
                      title="Result Rejected"
                      renderIcon={() => <NotSent />}>
                      {'Rejected'}
                    </Tag>
                  </div>
                  <Layer>
                    <TableToolbarSearch
                      expanded={true}
                      value={searchTerm}
                      onChange={handleChange}
                      placeholder={t('searchThisList', 'Search this list')}
                      size="sm"
                    />
                  </Layer>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} className={styles.activePatientsTable}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedActiveVisitRow} colSpan={headers.length + 2}>
                            {sortedLabRequests[index]?.obs !== null && sortedLabRequests[index]?.obs?.length > 0 && (
                              <TestsResults obs={sortedLabRequests[index]?.obs} />
                            )}{' '}
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noTestOrdersToDisplay', 'No test orders to display')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={filteredPastTestOrderResults?.length}
                onChange={({ pageSize, page }) => {
                  if (pageSize !== currentPageSize) {
                    setPageSize(pageSize);
                  }
                  if (page !== currentPage) {
                    goTo(page);
                  }
                }}
                className={styles.paginationOverride}
              />
            </TableContainer>
          )}
        </DataTable>
      </div>
    );
  }
};

export default LaboratoryPastTestOrderResults;
