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
import { convertToCurrency, extractString } from '../helpers';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { MappedBill } from '../types';
import styles from '../bills-table/bills-table.scss';
import { ConfigurableLink } from '@openmrs/esm-framework';

type PatientBillsProps = {
  patientUuid: string;
  bills: Array<MappedBill>;
  setPatientUuid: (patientUuid: string) => void;
};

const PastPatientBills: React.FC<PatientBillsProps> = ({ patientUuid, bills, setPatientUuid }) => {
  const { t } = useTranslation();

  if (!patientUuid) {
    return;
  }

  const tableHeaders = [
    { header: 'Date', key: 'date' },
    { header: 'Billable Service', key: 'billableService' },
    { header: 'Total Amount', key: 'totalAmount' },
  ];

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
              <p className={styles.content}>{t('noBillDisplay', 'There are no bills to display for this patient')}</p>
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
                  <TableHeader enableToggle={true} {...getExpandHeaderProps()} />
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

export default PastPatientBills;
