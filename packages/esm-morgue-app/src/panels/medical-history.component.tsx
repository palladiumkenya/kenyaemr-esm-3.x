import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CardHeader,
  EmptyState,
  getPatientUuidFromUrl,
  PatientChartPagination,
  usePaginationInfo,
} from '@openmrs/esm-patient-common-lib';
import { useInfiniteVisits } from '../hook/useMorgue.resource';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableToolbarSearch,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
  Layer,
  DataTableSkeleton,
  Pagination,
  TableToolbar,
  TableToolbarContent,
  Dropdown,
  Search,
} from '@carbon/react';
import EncounterObservations from './encounter-obs.component';
import { ErrorState, formatDate, isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import styles from './panels.scss';

const MedicalHistoryView: React.FC = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  const { visits, isLoading, error } = useInfiniteVisits(patientUuid);
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEncounterType, setSelectedEncounterType] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const encounterTypes = useMemo(() => {
    const types =
      visits?.flatMap((visit) => visit.encounters.map((encounter) => encounter.encounterType.display)) || [];
    return Array.from(new Set(types));
  }, [visits]);

  const encounters = useMemo(
    () =>
      visits?.flatMap((visit) =>
        visit?.encounters?.map((encounter) => ({
          visitType: visit?.visitType?.name,
          form: encounter?.form?.display,
          encounterType: encounter?.encounterType?.display,
          encounterDatetime: encounter?.encounterDatetime,
          obs: encounter?.obs,
        })),
      ) || [],
    [visits],
  );

  const filteredEncounters = useMemo(() => {
    return encounters?.filter((encounter) => {
      const matchesEncounterType =
        !selectedEncounterType ||
        selectedEncounterType === t('all', 'All') ||
        encounter.encounterType === selectedEncounterType;
      const matchesSearch =
        encounter.encounterType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        encounter.visitType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        encounter.form?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesEncounterType && matchesSearch;
    });
  }, [encounters, selectedEncounterType, searchTerm, t]);

  const paginatedEncounterItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEncounters.slice(startIndex, endIndex);
  }, [filteredEncounters, currentPage, pageSize]);

  const rows = paginatedEncounterItems?.map((encounter, idx) => ({
    id: `encounter-${idx}`,
    encounterDatetime: formatDate(new Date(encounter.encounterDatetime)),
    visitType: encounter.visitType,
    encounterType: encounter.encounterType,
    formName: encounter.form,
  }));

  if (isLoading) {
    return <DataTableSkeleton rowCount={10} />;
  }
  if (error) {
    return (
      <Layer>
        <ErrorState error={error} headerTitle={t('medicalHistory', 'Medical History')} />
      </Layer>
    );
  }
  if (!visits || visits.length === 0) {
    return (
      <EmptyState
        displayText={t('medicalHistory', 'Medical history')}
        headerTitle={t('medicalHistory', 'Medical History')}
      />
    );
  }

  const headers = [
    { header: t('date', 'Date'), key: 'encounterDatetime' },
    { header: t('visitType', 'Visit Type'), key: 'visitType' },
    { header: t('encounterType', 'Encounter Type'), key: 'encounterType' },
    { header: t('formName', 'Form Name'), key: 'formName' },
  ];

  return (
    <div className={styles.table}>
      <CardHeader title={t('medicalHistory', 'Medical History')} children={''} />
      <div className={styles.filterContainer}>
        <Dropdown
          id="serviceFilter"
          initialSelectedItem={t('all', 'All')}
          label=""
          type="inline"
          items={[t('all', 'All'), ...encounterTypes]}
          onChange={(e) => setSelectedEncounterType(e.selectedItem)}
          size={responsiveSize}
        />
        <Search
          size="sm"
          placeholder={t('searchThisList', 'Search this list')}
          labelText="Search"
          closeButtonLabelText="Clear search input"
          id="search-deceased"
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.search}
        />
      </div>

      <div className={styles.medicalHistoryContainer}>
        <DataTable className={styles.table} rows={rows} headers={headers} size={responsiveSize} useZebraStyles>
          {({
            rows,
            headers,
            getExpandHeaderProps,
            getTableProps,
            getTableContainerProps,
            getHeaderProps,
            getRowProps,
          }) => (
            <TableContainer {...getTableContainerProps()}>
              <Table {...getTableProps()} aria-label={t('medicalHistory', 'Medical History')}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <React.Fragment key={row.id}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
                          <div className={styles.container}>
                            <EncounterObservations observations={paginatedEncounterItems[index]['obs'] ?? []} />
                          </div>
                        </TableExpandedRow>
                      ) : null}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        <Pagination
          forwardText="Next page"
          backwardText="Previous page"
          page={currentPage}
          pageSize={pageSize}
          pageSizes={[5, 10, 20, 50, 100]}
          totalItems={filteredEncounters.length}
          className={styles.pagination}
          size={responsiveSize}
          onChange={({ pageSize: newPageSize, page: newPage }) => {
            setPageSize(newPageSize);
            setCurrentPage(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default MedicalHistoryView;
