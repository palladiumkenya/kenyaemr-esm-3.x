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
  OverflowMenu,
  OverflowMenuItem,
  TableExpandedRow,
  InlineLoading,
  StructuredListSkeleton,
} from '@carbon/react';
import { CardHeader, ErrorState, EmptyState } from '@openmrs/esm-patient-common-lib';
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
      <CardHeader title={headerTitle}>
        {isValidating && <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />}
      </CardHeader>{' '}
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
          <TableContainer title="DataTable" description="With expansion" {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label="sample table">
              <TableHead>
                <TableRow>
                  <TableExpandHeader aria-label="expand row" />
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
                      <TableHead>
                        <TableRow>
                          {expandHeader.map((header) => (
                            <TableHeader id={header.key} key={header.key}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      {tableRows[index].encounter.map(({ encounter }, index) => {
                        const { obs = [] } = encounter ?? {};
                        const uniqueDates = new Set();
                        return (
                          <table key={index}>
                            <TableBody>
                              {obs?.map((o, obsIndex) => {
                                if (
                                  !uniqueDates.has(o?.obsDatetime) &&
                                  o?.concept?.uuid === '1639AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                                ) {
                                  uniqueDates.add(o?.obsDatetime);
                                  return (
                                    <TableRow key={row.id}>
                                      <td>{o?.obsDatetime.split('T')[0]}</td>
                                      <td>{o?.value}</td>
                                      <td>
                                        <OverflowMenu ariaLabel="Actions" size="sm" flipped>
                                          <OverflowMenuItem
                                            hasDivider
                                            itemText={t('edit', 'Edit')}
                                            // onClick={}
                                          />
                                        </OverflowMenu>
                                      </td>
                                    </TableRow>
                                  );
                                }
                                return null;
                              })}
                            </TableBody>
                          </table>
                        );
                      })}
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
