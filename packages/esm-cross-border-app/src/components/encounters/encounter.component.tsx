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
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '@carbon/react';
import styles from './encounter.scss';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, usePatient } from '@openmrs/esm-framework';

const Encounter: React.FC = () => {
  const { t } = useTranslation();
  const headers = [];
  const rows = [];
  const patientUuid = 'd1369934-99f8-4dd5-8891-f54d39447a09';
  const { patient, isLoading } = usePatient(patientUuid);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleFormEntry = (formUuid: string, formName: string) => {
    launchWorkspace('cross-border-patient-search', {
      formUuid,
      encounterUuid: '',
    });
  };

  return (
    <div className={styles.encounterContainer}>
      <DataTable size="sm" rows={rows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getToolbarProps,
          onInputChange,
          getTableContainerProps,
        }) => (
          <TableContainer
            className={styles.encounterTable}
            title={t('crossBorderEncounters', 'Cross Border Encounters')}
            description={t('summaryOfCrossBorderEncounters', 'Summary of cross border encounters')}
            {...getTableContainerProps()}>
            <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
              <TableToolbarContent>
                <TableToolbarSearch persistent onChange={onInputChange} />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} aria-label={t('encounters', 'Encounters')}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      key={header.key}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
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
      </DataTable>
    </div>
  );
};

export default Encounter;
