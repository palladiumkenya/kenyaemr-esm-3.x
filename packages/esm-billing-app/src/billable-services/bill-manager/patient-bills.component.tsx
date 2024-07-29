import React, { useState } from 'react';
import {
  Layer,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
  Tile,
  Button,
} from '@carbon/react';
import { convertToCurrency, extractString } from '../../helpers';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration, EmptyState } from '@openmrs/esm-patient-common-lib';
import { MappedBill } from '../../types';
import styles from '../../bills-table/bills-table.scss';
import BillLineItems from './bill-line-items.component';
import { Scalpel } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';

type PatientBillsProps = {
  bills: Array<MappedBill>;
};

const PatientBills: React.FC<PatientBillsProps> = ({ bills }) => {
  const { t } = useTranslation();

  const tableHeaders = [
    { header: 'Date', key: 'date' },
    { header: 'Billable Service', key: 'billableService' },
    { header: 'Total Amount', key: 'totalAmount' },
  ];

  const tableRows = bills.map((bill) => ({
    id: `${bill.uuid}`,
    date: bill.dateCreated,
    billableService: extractString(bill.billingService),
    totalAmount: convertToCurrency(bill.totalAmount),
  }));

  const handleOpenWaiveBillWorkspace = (bill: MappedBill) => {
    launchWorkspace('waive-bill-form', {
      workspaceTitle: 'Waive Bill Form',
      bill,
    });
  };

  if (bills.length === 0) {
    return (
      <div style={{ marginTop: '1rem' }}>
        <EmptyState
          displayText={t('noBillDisplay', 'There are no bills to display for this patient')}
          headerTitle="No bills"
        />
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        compact
        size="sm"
        useZebraStyles
        render={({
          rows,
          headers,
          getHeaderProps,
          getExpandHeaderProps,
          getRowProps,
          getExpandedRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            title={t('patientBills', 'Patient bill')}
            description={t('patientBillsDescription', 'List of patient bills')}
            {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label="sample table">
              <TableHead>
                <TableRow>
                  <TableExpandHeader {...getExpandHeaderProps()} />
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow
                      {...getRowProps({
                        row,
                      })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      <TableCell>
                        <Scalpel
                          onClick={() => handleOpenWaiveBillWorkspace(bills[index])}
                          className={styles.scalpel}
                        />
                      </TableCell>
                    </TableExpandRow>
                    <TableExpandedRow
                      colSpan={headers.length + 2}
                      className={styles.expendableRow}
                      {...getExpandedRowProps({
                        row,
                      })}>
                      <BillLineItems bill={bills[index]} />
                    </TableExpandedRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
    </div>
  );
};

export default PatientBills;
