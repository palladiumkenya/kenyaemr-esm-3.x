import React, { useState } from 'react';
import {
  DataTable,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
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
import {
  formatDatetime,
  isDesktop,
  launchWorkspace,
  parseDate,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { MappedAdrEncounter } from '../../types';
import { TaskView } from '@carbon/react/icons';
type adrEncounterProps = {
  encounters: Array<MappedAdrEncounter>;
};

const AdrEncounter: React.FC<adrEncounterProps> = ({ encounters }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const pageSizes = [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(10);
  const headers = [
    { header: 'Date & time', key: 'encounterDatetime' },
    { header: 'Name', key: 'patientName' },
    { header: 'Visit type', key: 'visitTypeName' },
    { header: 'Form name', key: 'formName' },
    { header: 'Provider', key: 'provider' },
  ];
  const sortedEncounters = encounters.sort((a, b) => {
    const dateA = new Date(a.encounterDatetime || 0).getTime();
    const dateB = new Date(b.encounterDatetime || 0).getTime();
    return dateB - dateA;
  });
  const { paginated, goTo, results, currentPage } = usePagination(encounters, pageSize);
  const ReviewIcon = (props) => <TaskView {...props} />;

  const handler = (encounter) => {
    launchWorkspace('patient-adr-workspace', { encounter: encounter });
  };

  const tableRows = sortedEncounters.map((encounter) => ({
    encounterDatetime: encounter?.encounterDatetime
      ? formatDatetime(parseDate(encounter?.encounterDatetime), { mode: 'wide' })
      : '--',
    patientName: encounter?.patientName,
    visitTypeName: encounter?.visitTypeName,
    formName: encounter?.formName,
    id: encounter?.encounterUuid,
    provider: encounter?.provider || '--',
  }));
  if (encounters.length === 0) {
    return (
      <div className={styles.encounterContainer}>
        <EmptyState
          displayText={t('noAdrEncountersFound', 'Adr assessment encounters')}
          headerTitle={t('noEncountersFoundTitle', 'No encounters found')}
        />
      </div>
    );
  }

  return (
    <div className={styles.encounterContainer}>
      <Layer>
        <DataTable size={responsiveSize} rows={tableRows} headers={headers} useZebraStyles={false}>
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
              title={t('adrAssessmentEncounters', 'ADR Assessment Encounters')}
              description={t('summaryOfAdrAssessmentEncounters', 'Summary of ADR assessment encounters')}
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
                    <TableHeader aria-label={t('actions', 'Actions')} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      {...getRowProps({
                        row,
                      })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      <TableCell className="cds--table-column-menu">
                        <OverflowMenu size="sm" flipped>
                          <OverflowMenuItem onClick={() => handler(encounters[index])}>
                            {t('review', 'Review')}
                          </OverflowMenuItem>
                        </OverflowMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </Layer>
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

export default AdrEncounter;
