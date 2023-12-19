import React, { useEffect, useState } from 'react';
import {
  DataTable,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} from '@carbon/react';
import styles from './o-table.scss';
import EncounterObservations from '../encounter-observation/encounter-observation.component';

interface TableProps {
  tableHeaders: any;
  tableRows: any;
  formConceptMap: object;
}

export const OTable: React.FC<TableProps> = ({ tableHeaders, tableRows, formConceptMap }) => {
  return (
    <TableContainer>
      <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="short">
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                <TableExpandHeader enableToggle={false} />
                {headers.map((header) => (
                  <TableHeader
                    className={`${styles.productiveHeading01} ${styles.text02}`}
                    {...getHeaderProps({
                      header,
                      isSortable: header.isSortable,
                    })}>
                    {header.header?.content ?? header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                return (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2}>
                      <EncounterObservations
                        observations={tableRows?.[index]?.obs ?? []}
                        formConceptMap={formConceptMap}
                      />
                    </TableExpandedRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </TableContainer>
  );
};
