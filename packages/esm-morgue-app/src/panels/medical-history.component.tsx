import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader, EmptyState, getPatientUuidFromUrl, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
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
  TableCell,
  TableExpandedRow,
  Layer,
  DataTableSkeleton,
  Pagination,
  Dropdown,
  Search,
} from '@carbon/react';
import EncounterObservations from './encounter-obs.component';
import { ErrorState, formatDate, isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import styles from './panels.scss';
import { usePatientPaginatedEncounters } from '../hook/useMorgue.resource';

const defaultPageSize = 10;

const MedicalHistoryView: React.FC = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  const paginatedEncounter = usePatientPaginatedEncounters(patientUuid);
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEncounterType, setSelectedEncounterType] = useState<string | null>(null);
  const error = paginatedEncounter?.error;

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const { results, currentPage } = usePagination(paginatedEncounter?.data, pageSize);
  const { pageSizes } = usePaginationInfo(
    defaultPageSize,
    paginatedEncounter?.data?.length,
    currentPage,
    results.length,
  );

  const encounterTypes = useMemo(() => {
    const types = paginatedEncounter?.data?.flatMap((encounter: any) => encounter?.encounterType?.display);
    return Array.from(new Set(types));
  }, [paginatedEncounter]);

  const encounters = useMemo(() => {
    return (
      paginatedEncounter?.data?.flatMap((encounter: any) => ({
        visitType: encounter?.visit?.visitType?.display || 'Outpatient',
        form: encounter?.form?.display || 'Order',
        encounterType: encounter?.encounterType?.display || '',
        encounterDatetime: encounter?.encounterDatetime || '',
        obs: encounter?.obs || null,
      })) || []
    );
  }, [paginatedEncounter]);

  const filteredEncounters = useMemo(() => {
    return encounters?.filter((encounter) => {
      const matchesEncounterType =
        !selectedEncounterType ||
        selectedEncounterType === t('all', 'All') ||
        encounter.encounterType === selectedEncounterType;
      const matchesSearch =
        encounter?.encounterType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        encounter?.visitType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        encounter?.form?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesEncounterType && matchesSearch;
    });
  }, [encounters, selectedEncounterType, searchTerm, t]);

  const rows = filteredEncounters?.map((encounter, idx) => ({
    id: `encounter-${idx}`,
    encounterDatetime: formatDate(new Date(encounter.encounterDatetime)),
    visitType: encounter.visitType,
    encounterType: encounter.encounterType,
    formName: encounter.form,
  }));

  if (paginatedEncounter?.isLoading) {
    return <DataTableSkeleton rowCount={10} />;
  }

  if (error) {
    return (
      <Layer>
        <ErrorState error={error} headerTitle={t('medicalHistory', 'Medical History')} />
      </Layer>
    );
  }
  if (paginatedEncounter?.data?.length === 0) {
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
                            <EncounterObservations observations={filteredEncounters[index]['obs'] ?? []} />
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
          page={paginatedEncounter?.currentPage}
          pageSize={paginatedEncounter?.currentPageSize?.current}
          pageSizes={pageSizes}
          totalItems={paginatedEncounter?.totalCount}
          className={styles.pagination}
          size={responsiveSize}
          onChange={({ pageSize: newPageSize, page: newPage }) => {
            setPageSize(newPageSize);
            paginatedEncounter?.goTo(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default MedicalHistoryView;
