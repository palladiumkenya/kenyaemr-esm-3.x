import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import fuzzy from 'fuzzy';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
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
  TableSelectRow,
  Tile,
  Pagination,
  type DataTableHeader,
  type DataTableRow,
} from '@carbon/react';
import { formatDate, isDesktop, useDebounce, useLayoutType } from '@openmrs/esm-framework';
import styles from './pre-auth-table.scss';
import { LineItem, MappedBill } from '../../../types';
import { EmptyDataIllustration, PatientChartPagination } from '@openmrs/esm-patient-common-lib';

type PreAuthTableProps = {
  bill: MappedBill;
  isSelectable?: boolean;
  isLoadingBill?: boolean;
  onSelectItem?: (selectedLineItems: LineItem[]) => void;
};

const PreAuthTable: React.FC<PreAuthTableProps> = ({ bill, isSelectable = true, isLoadingBill, onSelectItem }) => {
  const { t } = useTranslation();
  const { lineItems } = bill;
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pendingLineItems = useMemo(
    () => (lineItems ? lineItems.filter((item) => item.paymentStatus === 'PENDING') : []),
    [lineItems],
  );

  const filteredLineItems = useMemo(() => {
    if (!debouncedSearchTerm) {
      return pendingLineItems || [];
    }

    return fuzzy
      .filter(debouncedSearchTerm, pendingLineItems || [], {
        extract: (lineItem: LineItem) => `${lineItem.item}`,
      })
      .sort((r1, r2) => r1.score - r2.score)
      .map((result) => result.original);
  }, [debouncedSearchTerm, pendingLineItems]);

  const paginatedLineItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredLineItems.slice(startIndex, endIndex);
  }, [filteredLineItems, currentPage, pageSize]);

  const tableHeaders: Array<typeof DataTableHeader> = [
    {
      header: t('serialNo', 'Serial No.'),
      key: 'serialno',
    },
    {
      header: t('billItem', 'Bill Item'),
      key: 'inventoryname',
    },
    {
      header: t('status', 'Status'),
      key: 'status',
    },
    {
      header: t('totalAmount', 'Total amount'),
      key: 'total',
    },
    {
      header: t('billCreationDate', 'Bill creation date'),
      key: 'dateofbillcreation',
    },
  ];

  const processBillItem = (item) => (item.item || item.billableService)?.split(':')[1];

  const tableRows: Array<typeof DataTableRow> = useMemo(
    () =>
      paginatedLineItems?.map((item) => {
        return {
          id: `${item.uuid}`,
          inventoryname: processBillItem(item),
          serialno: bill.receiptNumber,
          status: item.paymentStatus,
          total: item.price * item.quantity,
          dateofbillcreation: formatDate(new Date(bill.dateCreated), { mode: 'standard' }),
        };
      }) ?? [],
    [bill.dateCreated, bill.receiptNumber, paginatedLineItems],
  );

  if (isLoadingBill) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton
          columnCount={tableHeaders.length}
          showHeader={false}
          showToolbar={false}
          size={responsiveSize}
          zebra
        />
      </div>
    );
  }

  const handleRowSelection = (row: typeof DataTableRow, checked: boolean) => {
    const matchingRow = filteredLineItems.find((item) => item.uuid === row.id);
    let newSelectedLineItems;

    if (checked) {
      newSelectedLineItems = [...selectedLineItems, matchingRow];
    } else {
      newSelectedLineItems = selectedLineItems.filter((item) => item.uuid !== row.id);
    }
    setSelectedLineItems(newSelectedLineItems);
    onSelectItem(newSelectedLineItems);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.preAuthContainer}>
      <DataTable headers={tableHeaders} isSortable rows={tableRows} size={responsiveSize} useZebraStyles>
        {({ rows, headers, getRowProps, getSelectionProps, getTableProps, getToolbarProps }) => (
          <TableContainer
            className={styles.tableContainer}
            description={
              <span className={styles.tableDescription}>
                <span>
                  {t(
                    'selectitemstorequestforpreauth',
                    'Select items that are to be included in the pre authorization request',
                  )}
                </span>
              </span>
            }
            title={t('lineItems', 'Line items')}>
            <div className={styles.toolbarWrapper}>
              <TableToolbar {...getToolbarProps()} className={styles.tableToolbar} size={responsiveSize}>
                <TableToolbarContent className={styles.headerContainer}>
                  <TableToolbarSearch
                    className={styles.searchbox}
                    expanded
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    placeholder={t('searchThisTable', 'Search this table')}
                    size={responsiveSize}
                  />
                </TableToolbarContent>
              </TableToolbar>
            </div>
            <Table {...getTableProps()} aria-label="line items" className={styles.table}>
              <TableHead>
                <TableRow>
                  {rows.length > 1 && isSelectable ? <TableHeader /> : null}
                  {headers.map((header) => (
                    <TableHeader key={header.key}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  return (
                    <TableRow
                      key={row.id}
                      {...getRowProps({
                        row,
                      })}>
                      {rows.length > 1 && isSelectable && (
                        <TableSelectRow
                          aria-label="Select row"
                          {...getSelectionProps({ row })}
                          onChange={(checked: boolean) => handleRowSelection(row, checked)}
                          checked={Boolean(selectedLineItems?.find((item) => item?.uuid === row?.id))}
                        />
                      )}
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      {filteredLineItems?.length === 0 && (
        <div className={styles.filterEmptyState}>
          <Layer>
            <Tile className={styles.filterEmptyStateTile}>
              <div className={styles.empty__state}>
                <EmptyDataIllustration />
              </div>
              <p className={styles.filterEmptyStateContent}>
                {t('noMatchingItemsToDisplay', 'No matching items to display')}
              </p>
              <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
            </Tile>
          </Layer>
        </div>
      )}
      <PatientChartPagination
        currentItems={filteredLineItems.length}
        onPageNumberChange={handlePageChange}
        pageNumber={currentPage}
        pageSize={pageSize}
        totalItems={filteredLineItems.length}
      />
    </div>
  );
};

export default PreAuthTable;
