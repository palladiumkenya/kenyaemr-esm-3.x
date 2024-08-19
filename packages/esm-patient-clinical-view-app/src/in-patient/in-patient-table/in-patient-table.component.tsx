import React, { useMemo } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableExpandedRow,
  TableCell,
  Button,
} from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { Encounter } from '../encounter-observations/visit.resource';
import { useTranslation } from 'react-i18next';
import { formatDatetime, usePagination, Visit } from '@openmrs/esm-framework';
import EncounterObservations from '../encounter-observations';
import { EmptyState, launchPatientWorkspace, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import styles from './in-patient-table.scss';
import { mutate } from 'swr';

type InPatientTableProps = {
  tableRows: Array<Encounter>;
  currentVisit: Visit;
};

const InPatientTable: React.FC<InPatientTableProps> = ({ tableRows }) => {
  const { t } = useTranslation();
  const headers = [
    { key: 'dateTime', header: t('dateDate', 'Date & time') },
    { key: 'formName', header: t('formName', 'Form Name') },
    { key: 'provider', header: t('provider', 'Provider') },
    { key: 'encounterType', header: t('encounterType', 'Encounter Type') },
  ];

  const { results, goTo, currentPage } = usePagination(tableRows, 10);

  const paginatedRows = useMemo(() => {
    return results.map((row) => ({
      id: row.uuid,
      dateTime: formatDatetime(new Date(row.encounterDatetime), {
        mode: 'standard',
      }),
      formName: row.form.display,
      provider: row.encounterProviders[0]?.provider?.person?.display,
      encounterType: row.encounterType.display,
    }));
  }, [results]);

  const onEncounterEdit = (encounter: Encounter) => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: encounter.form.display,
      mutateForm: () => {
        mutate((key) => typeof key === 'string' && key.startsWith(`/ws/rest/v1/encounter`), undefined, {
          revalidate: true,
        });
      },
      formInfo: {
        encounterUuid: encounter.uuid,
        formUuid: encounter?.form?.uuid,
        additionalProps: {},
      },
    });
  };

  if (results.length === 0) {
    return (
      <EmptyState displayText={t('noEncounters', 'No encounters found')} headerTitle={t('encounters', 'Encounters')} />
    );
  }

  return (
    <>
      <DataTable className={styles.tableContainer} size="sm" useZebraStyles rows={paginatedRows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,

          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            title={t('encounters', 'Encounters')}
            description={t('encountersDescription', 'List of encounters during the current visit')}
            {...getTableContainerProps()}>
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
                    {row.isExpanded ? (
                      <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                        <>
                          <EncounterObservations observations={results[index].obs} />

                          <>
                            {results[index]?.form?.uuid && (
                              <Button
                                kind="ghost"
                                onClick={() => onEncounterEdit(results[index])}
                                renderIcon={(props) => <Edit size={16} {...props} />}>
                                {t('editThisEncounter', 'Edit this encounter')}
                              </Button>
                            )}
                          </>
                        </>
                      </TableExpandedRow>
                    ) : (
                      <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <PatientChartPagination
        currentItems={results.length}
        totalItems={tableRows?.length}
        pageNumber={currentPage}
        pageSize={10}
        onPageNumberChange={(page) => goTo(page)}
      />
    </>
  );
};

export default InPatientTable;
