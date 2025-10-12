import React from 'react';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
} from '@carbon/react';

interface TemperatureTableRow {
  id: string;
  date: string;
  timeSlot: string;
  exactTime: string;
  temperature: number;
}

interface TemperatureTableProps {
  tableData: TemperatureTableRow[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  controlSize: 'sm' | 'md';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const TemperatureTable: React.FC<TemperatureTableProps> = ({
  tableData,
  currentPage,
  pageSize,
  totalItems,
  controlSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = tableData.slice(startIndex, endIndex);
  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;
  const { pageSizes: calculatedPageSizes, itemsDisplayed } = usePaginationInfo(
    pageSize,
    totalPages,
    currentPage,
    tableData.length,
  );

  const tableHeaders = [
    { key: 'date', header: 'Date' },
    { key: 'exactTime', header: 'Time' },
    { key: 'temperature', header: 'Temperature (°C)' },
  ];

  return (
    <div>
      <DataTable rows={paginatedData} headers={tableHeaders}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer title="" description="">
            <Table {...getTableProps()} size="sm">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      {totalItems > 0 && (
        <>
          <Pagination
            page={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizes={calculatedPageSizes}
            onChange={(event) => {
              onPageChange(event.page);
              if (event.pageSize !== pageSize) {
                onPageSizeChange(event.pageSize);
              }
            }}
            size={controlSize}
          />
          {/* Human-readable items range, e.g. "1-5 / 20 items" */}
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#444' }}>{itemsDisplayed}</div>
        </>
      )}
    </div>
  );
};

export default TemperatureTable;
