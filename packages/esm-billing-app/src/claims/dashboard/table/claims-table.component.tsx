import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  type DataTableHeader,
  type DataTableRow,
} from '@carbon/react';
import { formatDate, isDesktop, useDebounce, useLayoutType } from '@openmrs/esm-framework';
import fuzzy from 'fuzzy';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineItem, MappedBill } from '../../../types';
import styles from './claims-table.scss';

type ClaimsTableProps = {
  bill: MappedBill;
  isSelectable?: boolean;
  isLoadingBill?: boolean;
  onSelectItem?: (selectedLineItems: LineItem[]) => void;
};

const ClaimsTable: React.FC<ClaimsTableProps> = ({ bill, isSelectable = true, isLoadingBill, onSelectItem }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter line items that are paid and paid through Insurance
  const insurancePaidLineItems = useMemo(() => {
    return (bill.lineItems || []).filter((lineItem) => {
      // Check if payment status is PAID
      const isPaid = lineItem.paymentStatus === 'PAID';

      // Check if there's an Insurance payment for this line item
      const hasInsurancePayment = bill.payments?.some(
        (payment) => payment.billLineItem?.uuid === lineItem.uuid && payment.instanceType?.name === 'Insurance',
      );

      return isPaid && hasInsurancePayment;
    });
  }, [bill.lineItems, bill.payments]);

  const filteredLineItems = useMemo(() => {
    if (!debouncedSearchTerm) {
      return insurancePaidLineItems;
    }

    return fuzzy
      .filter(debouncedSearchTerm, insurancePaidLineItems, {
        extract: (lineItem: LineItem) => `${lineItem.item || lineItem.billableService}`,
      })
      .sort((r1, r2) => r1.score - r2.score)
      .map((result) => result.original);
  }, [debouncedSearchTerm, insurancePaidLineItems]);

  const paginatedLineItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredLineItems.slice(startIndex, endIndex);
  }, [filteredLineItems, currentPage, pageSize]);

  const tableHeaders: Array<typeof DataTableHeader> = [
    { header: t('no', 'No'), key: 'no' },
    { header: t('serialNo', 'Serial No'), key: 'serialno' },
    { header: t('billItem', 'Bill Item'), key: 'inventoryname' },
    { header: t('status', 'Status'), key: 'status' },
    { header: t('paymentMethod', 'Payment Method'), key: 'paymentMethod' },
    { header: t('totalAmount', 'Total amount'), key: 'total' },
    { header: t('billCreationDate', 'Bill creation date'), key: 'dateofbillcreation' },
  ];

  const processBillItem = (item) => {
    const itemName = item?.item || item?.billableService;
    return itemName?.split(':')[1]?.trim() || itemName;
  };

  const getPaymentMethod = (lineItemUuid: string) => {
    const payment = bill.payments?.find((p) => p.billLineItem?.uuid === lineItemUuid);
    return payment?.instanceType?.name || 'Unknown';
  };

  const tableRows: Array<typeof DataTableRow> = useMemo(
    () =>
      paginatedLineItems?.map((item, index) => {
        return {
          no: `${index + 1}`,
          id: `${item.uuid}`,
          inventoryname: processBillItem(item),
          serialno: bill.receiptNumber,
          status: item.paymentStatus,
          paymentMethod: getPaymentMethod(item.uuid),
          total: item.price * item.quantity,
          dateofbillcreation: formatDate(new Date(bill.dateCreated), { mode: 'standard' }),
        };
      }) ?? [],
    [bill.dateCreated, bill.receiptNumber, bill.payments, paginatedLineItems],
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

  return (
    <div className={styles.claimContainer}>
      <DataTable headers={tableHeaders} isSortable rows={tableRows} size={responsiveSize} useZebraStyles>
        {({ rows, headers, getRowProps, getSelectionProps, getTableProps, getToolbarProps }) => (
          <TableContainer
            className={styles.tableContainer}
            description={
              <span className={styles.tableDescription}>
                <span>{t('insurancePaidItems', 'Items paid through Insurance')}</span>
              </span>
            }
            title={t('claimableItems', 'Claimable Items')}>
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
            <Table {...getTableProps()} aria-label="insurance claim line items" className={styles.table}>
              <TableHead>
                <TableRow>
                  {isSelectable ? <TableHeader /> : null}
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
                      {isSelectable && (
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
              <p className={styles.filterEmptyStateContent}>
                {t('noInsurancePaidItems', 'No items paid through insurance found')}
              </p>
            </Tile>
          </Layer>
        </div>
      )}
      {filteredLineItems.length > pageSize && (
        <Pagination
          forwardText="Next page"
          backwardText="Previous page"
          page={currentPage}
          pageSize={pageSize}
          pageSizes={[5, 10, 20, 50]}
          totalItems={filteredLineItems.length}
          className={styles.pagination}
          size={responsiveSize}
          onChange={({ pageSize: newPageSize, page: newPage }) => {
            setPageSize(newPageSize);
            setCurrentPage(newPage);
          }}
        />
      )}
    </div>
  );
};

export default ClaimsTable;
