import React, { useMemo } from 'react';
import styles from './shr-summary.scss';
import { useTranslation } from 'react-i18next';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import { itemDetails } from '../types';
import { usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';

interface SHRDataTableProps {
  data: itemDetails[];
}

const SHRVitalsDataTable: React.FC<SHRDataTableProps> = ({ data }) => {
  const { t } = useTranslation();
  const tableHeaders = ['Name', 'Value', 'Date Recorded'];
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = `\${openmrsSpaBase}/patient/test/chart/SHR`;

  const pagesize = 5;
  const { results: paginatedData, goTo, currentPage } = usePagination(data ?? [], pagesize);

  const tableRows = useMemo(() => {
    return paginatedData?.map((payload) => ({
      ...[payload],
    }));
  }, [paginatedData]);

  return (
    <div className={styles.widgetCard}>
      <DataTable rows={tableRows} headers={tableHeaders}>
        {({ rows, headers, getHeaderProps, getRowProps }) => (
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  <TableCell>{row[0].name}</TableCell>
                  <TableCell>{row[0].value}</TableCell>
                  <TableCell>{row[0].dateRecorded}</TableCell>
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

export default SHRVitalsDataTable;
