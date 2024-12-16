import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTableSkeleton,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Pagination,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Button,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import {
  ErrorState,
  usePaginationInfo,
  CardHeader,
  useLaunchWorkspaceRequiringVisit,
  EmptyState,
} from '@openmrs/esm-patient-common-lib';
import { useBills } from '../billing.resource';
import InvoiceTable from '../invoice/invoice-table.component';
import styles from './bill-history.scss';

interface BillHistoryProps {
  patientUuid: string;
}

const BillHistory: React.FC<BillHistoryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { bills, isLoading, error } = useBills(patientUuid);
  const launchPatientWorkspace = useLaunchWorkspaceRequiringVisit('billing-form');
  const layout = useLayoutType();
  const [pageSize, setPageSize] = React.useState(10);
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { paginated, goTo, results, currentPage } = usePagination(bills, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, bills?.length, currentPage, results?.length);

  const handleLaunchBillForm = () => {
    launchPatientWorkspace({ workspaceTitle: t('billingForm', 'Billing Form') });
  };

  const headerData = [
    {
      header: t('visitTime', 'Visit time'),
      key: 'visitTime',
    },
    {
      header: t('identifier', 'Identifier'),
      key: 'identifier',
    },
    {
      header: t('billedItems', 'Billed Items'),
      key: 'billedItems',
    },
    {
      header: t('billTotal', 'Bill total'),
      key: 'billTotal',
    },
  ];

  const setBilledItems = (bill) =>
    bill.lineItems?.reduce(
      (acc, item) => acc + (acc ? ' & ' : '') + (item.billableService?.split(':')[1] || item.item?.split(':')[1] || ''),
      '',
    );

  const rowData = results?.map((bill) => ({
    id: bill.uuid,
    uuid: bill.uuid,
    billTotal: bill.totalAmount,
    visitTime: bill.dateCreated,
    identifier: bill.identifier,
    billedItems: setBilledItems(bill),
  }));

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton showHeader={false} showToolbar={false} zebra size={responsiveSize} />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('billsList', 'Bill list')} />;
  }

  if (bills.length === 0) {
    return (
      <EmptyState
        displayText={'Patient Billing'}
        headerTitle={t('patientBilling', 'Patient billing')}
        launchForm={handleLaunchBillForm}
      />
    );
  }

  return (
    <div>
      <CardHeader title={t('patientBilling', 'Patient billing')}>
        <Button renderIcon={Add} onClick={handleLaunchBillForm} kind="ghost">
          {t('addBill', 'Add bill item(s)')}
        </Button>
      </CardHeader>
      <div className={styles.billHistoryContainer}>
        <DataTable isSortable rows={rowData} headers={headerData} size={responsiveSize} useZebraStyles>
          {({
            rows,
            headers,
            getExpandHeaderProps,
            getTableProps,
            getTableContainerProps,
            getHeaderProps,
            getRowProps,
          }) => (
            <TableContainer {...getTableContainerProps}>
              <Table className={styles.table} {...getTableProps()} aria-label="Bill list">
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header, i) => (
                      <TableHeader
                        key={i}
                        {...getHeaderProps({
                          header,
                        })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => {
                    const currentBill = bills?.find((bill) => bill.uuid === row.id);

                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
                            <div className={styles.container} key={i}>
                              <InvoiceTable bill={currentBill} isSelectable={false} />
                            </div>
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        {paginated && (
          <Pagination
            forwardText={t('nextPage', 'Next page')}
            backwardText={t('previousPage', 'Previous page')}
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={bills.length}
            className={styles.pagination}
            size={responsiveSize}
            onChange={({ page: newPage, pageSize }) => {
              if (newPage !== currentPage) {
                goTo(newPage);
              }
              setPageSize(pageSize);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BillHistory;
