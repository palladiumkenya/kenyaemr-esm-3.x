import React, { Dispatch, SetStateAction } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  InlineLoading,
} from '@carbon/react';
import { Close } from '@carbon/react/icons';
import { convertToCurrency, extractString } from '../helpers';
import { useTranslation } from 'react-i18next';
import { MappedBill } from '../types';
import styles from './patient-bills.scss';
import { ConfigurableLink, getPatientName, usePatient } from '@openmrs/esm-framework';
import capitalize from 'lodash/capitalize';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import EmptyPatientBill from './patient-bills-dashboard/empty-patient-bill.component';

type PatientBillsProps = {
  patientUuid: string;
  bills: Array<MappedBill>;
  onCancel: Dispatch<SetStateAction<string>>;
};

export const patientBillsHeaders = [
  { header: 'Date', key: 'date' },
  { header: 'Charge Item', key: 'chargeItem' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'Status', key: 'status' },
];

export const PatientBills: React.FC<PatientBillsProps> = ({ bills, onCancel, patientUuid }) => {
  const { t } = useTranslation();
  const { patient, isLoading, error } = usePatient(patientUuid);

  if (isLoading) {
    return <InlineLoading status="active" description={t('loading', 'Loading...')} />;
  }

  const billingUrl = '${openmrsSpaBase}/home/billing/patient/${patientUuid}/${uuid}';

  if (bills.length === 0) {
    return (
      <>
        <PatientHeader patient={patient} onCancel={onCancel} />
        <EmptyPatientBill
          title={t('noBillsFound', 'No bills found')}
          subTitle={t('noBillsFoundDescription', 'No bills found for this patient')}
        />
      </>
    );
  }

  const tableRows = bills.map((bill) => ({
    id: `${bill.uuid}`,
    date: bill.dateCreated,
    chargeItem: (
      <ConfigurableLink
        style={{ textDecoration: 'none', maxWidth: '50%' }}
        to={billingUrl}
        templateParams={{ patientUuid: bill.patientUuid, uuid: bill.uuid }}>
        {bill.lineItems.map((item) => extractString(item.billableService)).join(', ')}
      </ConfigurableLink>
    ),
    totalAmount: convertToCurrency(bill.totalAmount),
    status: bill.status,
  }));

  return (
    <div className={styles.container}>
      <PatientHeader patient={patient} onCancel={onCancel} />
      <DataTable
        rows={tableRows}
        headers={patientBillsHeaders}
        size="sm"
        useZebraStyles
        render={({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer
            title={t('patientBillsSummary', 'Patient bill summary')}
            description={t('patientBillsSummaryDescription', 'A list of all bills for this patient')}
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

type PatientHeaderProps = {
  patient: fhir.Patient;
  onCancel: Dispatch<SetStateAction<string>>;
};

export const PatientHeader: React.FC<PatientHeaderProps> = ({ patient, onCancel }) => {
  const { t } = useTranslation();
  const patientName = getPatientName(patient);
  const identifier = patient?.identifier[0]?.value ?? '--';

  return (
    <div className={styles.patientHeaderContainer}>
      <div className={styles.patientNameContainer}>
        <span className={styles.patientName}>{patientName}</span>
        <span className={styles.patientGender}>{capitalize(patient.gender)}</span>
        <span className={styles.identifier}>{identifier}</span>
      </div>
      <div className={styles.headerActions}>
        <Button kind="ghost" onClick={() => onCancel('')} renderIcon={Close}>
          {t('close', 'Close')}
        </Button>
      </div>
    </div>
  );
};
