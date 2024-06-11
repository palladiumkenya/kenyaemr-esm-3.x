import React, { useState, useMemo } from 'react';
import {
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  TableToolbar,
  TableToolbarContent,
  Layer,
  TableToolbarSearch,
  Dropdown,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import styles from './orders-data-table.scss';
import { useTranslation } from 'react-i18next';

interface OrdersDataTableProps {
  tabTitle: string;
  currentPage: number;
  currentPageSize: number;
  pageSizes: number[];
  totalItems: number;
  setPageSize: (page: number) => void;
  goTo: (page: number) => void;
  orders: Array<Record<string, any>>;
  rows: Array<Record<string, any>>;
  columns: Array<Record<string, any>>;
}

const OrdersDataTable: React.FC<OrdersDataTableProps> = ({
  tabTitle,
  currentPage,
  currentPageSize,
  pageSizes,
  totalItems,
  setPageSize,
  goTo,
  rows,
  columns,
}) => {
  const { t } = useTranslation();

  const [activatedOnOrAfterDate, setActivatedOnOrAfterDate] = useState('');

  return (
    <DataTable rows={rows} headers={columns} useZebraStyles>
      {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
        <TableContainer className={styles.tableContainer}>
          <TableToolbar style={{ position: 'static' }}>
            <TableToolbarContent>
              <Layer style={{ margin: '5px' }}>
                <DatePicker dateFormat="Y-m-d" datePickerType="single">
                  <DatePickerInput
                    labelText={''}
                    id="activatedOnOrAfterDate"
                    placeholder="YYYY-MM-DD"
                    onChange={(event) => {
                      setActivatedOnOrAfterDate(event?.target?.value);
                    }}
                    type="date"
                    value={activatedOnOrAfterDate}
                  />
                </DatePicker>
              </Layer>
              <Layer style={{ margin: '5px' }}>
                <TableToolbarSearch persistent placeholder={t('searchThisList', 'Search this list')} size="sm" />
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
              {rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                    ))}
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 ? (
            <div className={styles.tileContainer}>
              <Tile className={styles.tile}>
                <div className={styles.tileContent}>
                  <p className={styles.content}>{t('noOrdersList', `No ${tabTitle} orders to display`)}</p>
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
            totalItems={totalItems}
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
};

export default OrdersDataTable;
