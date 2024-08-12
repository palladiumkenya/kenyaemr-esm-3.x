import React from 'react';
import {
  Layer,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  Tile,
} from '@carbon/react';
import { convertToCurrency, extractBillableServiceReadableString, extractString } from '../helpers';
import { useTranslation } from 'react-i18next';
import { MappedBill } from '../types';
import styles from '../bills-table/bills-table.scss';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

type PatientBillsProps = {
  bills: Array<MappedBill>;
};

export const patientBillsHeaders = [
  { header: 'Date', key: 'date' },
  { header: 'Billable Service (s)', key: 'billableService' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'status', key: 'status' },
];

export const PatientBills: React.FC<PatientBillsProps> = ({ bills }) => {
  const { t } = useTranslation();

  const billingUrl = '${openmrsSpaBase}/home/billing/patient/${patientUuid}/${uuid}';

  const tableRows = bills.map((bill) => ({
    id: `${bill.uuid}`,
    date: (
      <ConfigurableLink
        style={{ textDecoration: 'none', maxWidth: '50%' }}
        to={billingUrl}
        templateParams={{ patientUuid: bill.patientUuid, uuid: bill.uuid }}>
        {bill.dateCreated}
      </ConfigurableLink>
    ),
    billableService: extractBillableServiceReadableString(bill.billingService),
    totalAmount: convertToCurrency(bill.totalAmount),
    status: bill.status,
  }));

  if (bills.length === 0) {
    <EmptyState displayText={'Pending Patient Bills Found'} headerTitle={'No Pending Patient Bills Found'} />;
  }

  return (
    <div className={styles.container}>
      <DataTable
        rows={tableRows}
        headers={patientBillsHeaders}
        size="sm"
        useZebraStyles
        render={({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer
            title={t('patientBills', 'Patient bill')}
            description={t('patientBillsDescription', 'List of patient bills')}
            {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label="sample table">
              <TableHead>
                <TableRow>
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    {...getRowProps({
                      row,
                    })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
    </div>
  );
};
