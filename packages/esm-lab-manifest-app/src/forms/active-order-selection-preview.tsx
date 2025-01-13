import React from 'react';

import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from '../tables/lab-manifest-table.scss';
import { ActiveRequestOrder } from '../types';
import PatientCCCNumbercell from '../tables/patient-ccc-no-cell.component';

interface ActiveOrdersSelectionPreviewProps {
  orders?: Array<ActiveRequestOrder>;
}

const ActiveOrdersSelectionPreview: React.FC<ActiveOrdersSelectionPreviewProps> = ({ orders = [] }) => {
  const { t } = useTranslation();

  const headers = [
    {
      header: t('patientName', 'Patient name'),
      key: 'patientName',
    },
    {
      header: t('cccKDODNumber', 'CCC/KDOD Number'),
      key: 'cccKdod',
    },
    {
      header: t('dateRequested', 'Date Requested'),
      key: 'dateRequested',
    },
  ];

  const tableRows =
    orders?.map((activeRequest) => {
      return {
        id: `${activeRequest.orderUuid}`,
        patientName: activeRequest.patientName,
        cccKdod: activeRequest.cccKdod?.trim()?.replaceAll(' ', '') ? (
          activeRequest.cccKdod
        ) : activeRequest?.patientUuid ? (
          <PatientCCCNumbercell patientUuid={activeRequest?.patientUuid} />
        ) : (
          '--'
        ),
        dateRequested: activeRequest.dateRequested,
      };
    }) ?? [];
  return (
    <div className={styles.widgetContainer}>
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows ?? []}
        headers={headers}
        render={({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <>
            <TableContainer {...getTableContainerProps()}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header, i) => (
                      <TableHeader key={i} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i} {...getRowProps({ row })} onClick={(evt) => {}}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      />
    </div>
  );
};

export default ActiveOrdersSelectionPreview;
