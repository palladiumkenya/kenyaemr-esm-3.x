import React from 'react';
import { useBills } from '../../billing.resource';
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
} from '@carbon/react';
import { convertToCurrency, extractString } from '../../helpers';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import PatientBillsSelections from './bill-selection.component';
import { MappedBill } from '../../types';
import styles from '../../bills-table/bills-table.scss';

type PatientBillsProps = {
  patientUuid: string;
  bills: Array<MappedBill>;
  setPatientUuid: (patientUuid: string) => void;
};

const PatientBills: React.FC<PatientBillsProps> = ({ patientUuid, bills, setPatientUuid }) => {
  const { t } = useTranslation();

  if (!patientUuid) {
    return;
  }

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

  if (bills.length === 0 && patientUuid !== '') {
    return (
      <>
        <div style={{ marginTop: '0.625rem' }}>
          <Layer className={styles.emptyStateContainer}>
            <Tile className={styles.tile}>
              <div className={styles.illo}>
                <EmptyDataIllustration />
              </div>
              <p className={styles.content}>{t('noBilltoDisplay', 'There are no bills to display for this patient')}</p>
            </Tile>
          </Layer>
        </div>
      </>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
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
                  <TableExpandHeader enableToggle={true} {...getExpandHeaderProps()} />
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
                  <React.Fragment key={row.id}>
                    <TableExpandRow
                      {...getRowProps({
                        row,
                      })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    <TableExpandedRow
                      colSpan={headers.length + 1}
                      className="demo-expanded-td"
                      {...getExpandedRowProps({
                        row,
                      })}>
                      <div>
                        <PatientBillsSelections bills={bills[index]} setPatientUuid={setPatientUuid} />
                      </div>
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
