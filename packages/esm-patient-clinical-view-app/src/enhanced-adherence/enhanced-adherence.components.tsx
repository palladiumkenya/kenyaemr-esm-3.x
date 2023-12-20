import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientEnhancedAdherence } from '../hooks/usePatientEnhancedAdherence';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  DataTable,
  TableContainer,
  TableHeader,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  StructuredListSkeleton,
} from '@carbon/react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import AdherenceTable from './adherence-table.component';
type EnhancedAdherenceProps = {
  patientUuid: string;
};

const EnhancedAdherence: React.FC<EnhancedAdherenceProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('enhancedadherence', 'Advanced Enhanced Adherence');
  const { patientAdherence, error, isLoading, isValidating } = usePatientEnhancedAdherence(patientUuid);
  const headers = [
    {
      header: t('startedOnDate', 'Started on Date'),
      key: 'sessionDate',
    },
  ];
  const expandHeader = [
    {
      header: t('date', 'Session Start Date'),
      key: 'sessionDate',
    },
    {
      header: t('sessionNumber', 'Session number'),
      key: 'sessionNumber',
    },
    {
      header: t('editForm', 'Form'),
      key: 'editForm',
    },
  ];
  const tableRows = Object.entries(patientAdherence)
    .map(([key, value]) => {
      return { sessionDate: key, value: value };
    })
    .map((adherence, index) => ({ id: `${index}`, sessionDate: adherence.sessionDate, encounter: adherence.value }));
  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }
  return (
    <>
      <DataTable rows={tableRows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getExpandedRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer title={headerTitle} {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label={headerTitle}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader aria-label={headerTitle} />
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
                      className={headerTitle}
                      {...getExpandedRowProps({
                        row,
                      })}>
                      <TableHead>
                        <TableRow>
                          {expandHeader.map((header) => (
                            <TableHeader id={header.key} key={header.key}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <AdherenceTable encounterData={tableRows[index].encounter} />
                    </TableExpandedRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </>
  );
};
export default EnhancedAdherence;
