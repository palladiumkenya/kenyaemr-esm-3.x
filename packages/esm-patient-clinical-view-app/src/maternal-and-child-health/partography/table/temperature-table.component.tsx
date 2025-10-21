import React from 'react';
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
  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = tableData.slice(startIndex, endIndex);

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
        <Pagination
          page={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizes={[5, 10, 20, 50]}
          onChange={(event) => {
            onPageChange(event.page);
            if (event.pageSize !== pageSize) {
              onPageSizeChange(event.pageSize);
            }
          }}
          size={controlSize}
        />
      )}
    </div>
  );
};

export default TemperatureTable;
