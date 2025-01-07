import React, { useState } from 'react';
import {
  DataTable,
  Pagination,
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
import { formatDatetime, isDesktop, parseDate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { MappedCbEncounter } from '../../types';
type CbEncounterProps = {
  encounters: Array<MappedCbEncounter>;
};

const Encounter: React.FC<CbEncounterProps> = ({ encounters }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const pageSizes = [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(10);
  const headers = [
    { header: 'Date & time', key: 'encounterDatetime' },
    { header: 'Name', key: 'patientName' },
    { header: 'Visit type', key: 'visit' },
    { header: 'Form name', key: 'form' },
  ];
  const sortedEncounters = encounters.sort((a, b) => {
    const dateA = new Date(a.encounterDatetime || 0).getTime();
    const dateB = new Date(b.encounterDatetime || 0).getTime();
    return dateB - dateA;
  });
  const { paginated, goTo, results, currentPage } = usePagination(encounters, pageSize);

  const tableRows = sortedEncounters.map((encounter) => ({
    encounterDatetime: encounter?.encounterDatetime
      ? formatDatetime(parseDate(encounter?.encounterDatetime), { mode: 'wide' })
      : '--',
    patientName: encounter?.patientName,
    visit: encounter?.visit,
    form: encounter?.form,
    id: encounter?.encounterUuid,
  }));
  if (encounters.length === 0) {
    return (
      <div className={styles.encounterContainer}>
        <EmptyState
          displayText={t('noEncountersFound', 'cross border encounters')}
          headerTitle={t('noEncountersFoundTitle', 'No encounters found')}
        />
      </div>
    );
  }

  return (
    <div className={styles.encounterContainer}>
      <DataTable size={responsiveSize} rows={tableRows} headers={headers}>
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
      {paginated && (
        <Pagination
          forwardText="Next page"
          backwardText="Previous page"
          page={currentPage}
          pageSize={pageSize}
          pageSizes={pageSizes}
          totalItems={encounters?.length}
          className={styles.pagination}
          size={responsiveSize}
          onChange={({ pageSize: newPageSize, page: newPage }) => {
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize);
            }
            if (newPage !== currentPage) {
              goTo(newPage);
            }
          }}
        />
      )}
    </div>
  );
};

export default Encounter;
