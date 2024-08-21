import React, { useMemo } from 'react';
import styles from './shr-summary.scss';
import { useTranslation } from 'react-i18next';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import { usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';

interface SHRDataTableProps {
  data: Array<any>;
  tableHeaders: Array<any>;
}

const SHRDataTable: React.FC<SHRDataTableProps> = ({ data, tableHeaders }) => {
  const { t } = useTranslation();

  const pagesize = 5;
  const { results: paginatedData, goTo, currentPage } = usePagination(data ?? [], pagesize);

  const tableRows = useMemo(() => {
    return paginatedData?.map((payload, index) => ({
      id: `${payload.uuid}-${index}`,
      ...payload,
    }));
  }, [paginatedData]);

  return (
    <div className={styles.widgetCard}>
      <DataTable rows={tableRows} headers={tableHeaders}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      <PatientChartPagination
        currentItems={paginatedData.length}
        onPageNumberChange={({ page }) => goTo(page)}
        pageNumber={currentPage}
        pageSize={pagesize}
        totalItems={data.length}
      />
    </div>
  );
};

export default SHRDataTable;
