import React from 'react';
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
  isExpandable?: boolean;
}

export const OTable: React.FC<TableProps> = ({ tableHeaders, tableRows, formConceptMap, isExpandable }) => {
  return (
    <TableContainer>
      <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="sm">
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
              {rows.map((row, parentIndex) => (
                <React.Fragment key={parentIndex}>
                  <TableExpandRow {...getRowProps({ row })}>
                    {row.cells.map((cell, childIndex) => (
                      <TableCell key={childIndex}>{cell.value}</TableCell>
                    ))}
                  </TableExpandRow>
                  {row.isExpanded ? (
                    <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
                      <EncounterObservations
                        observations={tableRows?.[parentIndex]?.obs ?? []}
                        formConceptMap={formConceptMap}
                      />
                    </TableExpandedRow>
                  ) : (
                    <TableExpandedRow
                      className={styles.hiddenRow}
                      colSpan={headers.length + 2}
                      key={`${parentIndex}-hiddenRow`}
                    />
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </TableContainer>
  );
};
