import {
  Button,
  TabPanel,
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  Tooltip,
  TableToolbarAction,
  TableToolbarMenu,
} from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { isDesktop, launchWorkspace, restBaseUrl, useDebounce } from '@openmrs/esm-framework';
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceRepresentation } from './../api';
import FilterStockItems from './filter-stock-items.component';
import { useStockItemsPages } from './stock-items-table.resource';
import styles from './stock-items-table.scss';
import { handleMutate } from './../utils';

interface StockItemsTableProps {
  from?: string;
}

const StockItemsTableComponent: React.FC<StockItemsTableProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');

  const handleRefresh = () => {
    handleMutate(`${restBaseUrl}/stockmanagement/stockitem`);
  };

  const {
    isLoading,
    items,
    totalCount,
    currentPageSize,
    setPageSize,
    pageSizes,
    currentPage,
    setCurrentPage,
    isDrug,
    setDrug,
    setSearchString,
  } = useStockItemsPages(ResourceRepresentation.Full);

  const handleSearch = (query: string) => {
    setSearchInput(query);
  };

  const debouncedSearch = useDebounce(searchInput, 1000);

  useEffect(() => {
    setSearchString(debouncedSearch);
  }, [debouncedSearch]);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('type', 'Type'),
        key: 'type',
      },
      {
        id: 1,
        header: t('commonName', 'Common Name'),
        key: 'commonName',
      },
      {
        id: 2,
        header: t('tradeName', 'Trade Name'),
        key: 'tradeName',
      },
      {
        id: 3,
        header: t('dispensingUnitName', 'Dispensing UoM'),
        key: 'dispensingUnitName',
      },
      {
        id: 4,
        header: t('purchasePrice', 'Price'),
        key: 'purchasePrice',
      },
      {
        id: 5,
        key: 'actions',
        header: 'Actions',
      },
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return items?.map((stockItem, index) => ({
      ...stockItem,
      id: stockItem?.uuid,
      key: `key-${stockItem?.uuid}`,
      uuid: `${stockItem?.uuid}`,
      type: stockItem?.drugUuid ? t('drug', 'Drug') : t('other', 'Other'),
      commonName: stockItem?.commonName,
      tradeName: stockItem?.drugUuid ? stockItem?.conceptName : '',
      preferredVendorName: stockItem?.preferredVendorName,
      dispensingUoM: stockItem?.defaultStockOperationsUoMName,
      dispensingUnitName: stockItem?.dispensingUnitName,
      defaultStockOperationsUoMName: stockItem?.defaultStockOperationsUoMName,
      purchasePrice: stockItem?.purchasePrice,
      actions: (
        <Tooltip align="bottom" label="Edit Purchase Price">
          <Button
            kind="ghost"
            size="md"
            onClick={() => {
              launchWorkspace('edit-purchase-price-form', {
                workspaceTitle: t('editPurchasePriceForm', 'Edit Purchase Price Form'),
                stockItem: stockItem,
              });
            }}
            iconDescription={t('editStockItemPrice', 'Edit Purchase Price')}
            renderIcon={(props) => <Edit size={16} {...props} />}></Button>
        </Tooltip>
      ),
    }));
  }, [items, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <TabPanel>{t('commoditiesPanelDescription', 'Edit Stock Item Prices.')}</TabPanel>

      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        isSortable
        useZebraStyles
        render={({ rows, headers, getHeaderProps, getTableProps, getRowProps, getBatchActionProps }) => (
          <TableContainer>
            <TableToolbar
              style={{
                position: 'static',
                overflow: 'visible',
                backgroundColor: 'color',
              }}>
              <TableBatchActions {...getBatchActionProps()}></TableBatchActions>
              <TableToolbarContent
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}>
                <TableToolbarSearch persistent value={searchInput} onChange={(e) => handleSearch(e.target.value)} />

                <FilterStockItems filterType={isDrug} changeFilterType={setDrug} />
                <TableToolbarMenu>
                  <TableToolbarAction onClick={handleRefresh}>Refresh</TableToolbarAction>
                </TableToolbarMenu>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map(
                    (header) =>
                      header.key !== 'details' && (
                        <TableHeader
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                          className={isDesktop ? styles.desktopHeader : styles.tabletHeader}
                          key={`${header.key}`}
                          isSortable={header.key !== 'name'}>
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ),
                  )}
                  <TableHeader></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        className={isDesktop ? styles.desktopRow : styles.tabletRow}
                        {...getRowProps({ row })}
                        key={row.id}>
                        {row.cells.map(
                          (cell) =>
                            cell?.info?.header !== 'details' && <TableCell key={cell.id}>{cell.value}</TableCell>,
                        )}
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
                    <p className={styles.content}>{t('noItemsToDisplay', 'No Stock Items to display')}</p>
                    <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </TableContainer>
        )}></DataTable>

      <Pagination
        page={currentPage}
        pageSize={currentPageSize}
        pageSizes={pageSizes}
        totalItems={totalCount}
        onChange={({ page, pageSize }) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        className={styles.paginationOverride}
      />
    </>
  );
};

export default StockItemsTableComponent;
