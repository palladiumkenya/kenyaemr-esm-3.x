import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
  Tag,
  DataTableSkeleton,
  Search,
} from '@carbon/react';
import { launchWorkspace, navigate, useConfig, useLayoutType, useVisit } from '@openmrs/esm-framework';
import styles from '../bed-linelist-view.scss';
import { convertDateToDays, formatDateTime } from '../../utils/utils';
import { Patient, Person, type MortuaryLocationResponse } from '../../types';
import { ConfigObject } from '../../config-schema';
import { mutate as mutateSWR } from 'swr';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';

interface AdmittedBedLineListViewProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  paginated?: boolean;
  initialPageSize?: number;
  pageSizes?: number[];
  onPostmortem?: (patientUuid: string) => void;
  onDischarge?: (patientUuid: string) => void;
  onSwapCompartment?: (patientUuid: string, bedId: string) => void;
  onDispose?: (patientUuid: string) => void;
  mutate?: () => void;
}

const AdmittedBedLineListView: React.FC<AdmittedBedLineListViewProps> = ({
  AdmittedDeceasedPatient,
  isLoading,
  paginated = true,
  initialPageSize = 10,
  pageSizes = [10, 20, 30, 40, 50],
  onPostmortem,
  onDischarge,
  onSwapCompartment,
  onDispose,
  mutate,
}) => {
  const { t } = useTranslation();
  const { autopsyFormUuid } = useConfig<ConfigObject>();
  const isTablet = useLayoutType() === 'tablet';
  const controlSize = isTablet ? 'md' : 'sm';

  const [currentPage, setCurrentPage] = useState(1);
  const [currPageSize, setCurrPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState('');

  const DaysInMortuary = ({ patientUuid }: { patientUuid: string }) => {
    const { activeVisit } = useVisit(patientUuid);
    const days = convertDateToDays(activeVisit?.startDatetime);

    return (
      <>
        {days} {days === 1 ? t('day', 'Day') : t('days', 'Days')}
      </>
    );
  };

  const AdmissionDate = ({ patientUuid }: { patientUuid: string }) => {
    const { activeVisit } = useVisit(patientUuid);
    return <>{activeVisit?.startDatetime ? formatDateTime(activeVisit.startDatetime) : '-'}</>;
  };

  const headers = [
    { key: 'admissionDate', header: t('admissionDate', 'Admission Date') },
    { key: 'idNumber', header: t('idNumber', 'ID Number') },
    { key: 'patientName', header: t('patientName', 'Patient Name') },
    { key: 'gender', header: t('gender', 'Gender') },
    { key: 'age', header: t('age', 'Age') },
    { key: 'bedNumber', header: t('compartmentNumber', 'Compartment number') },
    { key: 'compartmentShare', header: t('compartmentShare', 'Compartment Share') },
    { key: 'bedType', header: t('bedType', 'Bed Type') },
    { key: 'daysAdmitted', header: t('daysInMortuary', 'Days in Mortuary') },
    { key: 'status', header: t('status', 'Status') },
    { key: 'action', header: t('action', 'Action') },
  ];

  const handlePostmortem = (patientUuid: string, bedInfo?: { bedNumber: string; bedId: number }) => {
    const hasBedInfo = bedInfo?.bedNumber && bedInfo?.bedId;

    if (onPostmortem) {
      onPostmortem(patientUuid);
    } else {
      launchWorkspace('mortuary-form-entry', {
        formUuid: autopsyFormUuid,
        workspaceTitle: t('postmortemForm', 'Postmortem form'),
        patientUuid: patientUuid,
        encounterUuid: '',
        mutateForm: () => {
          mutateSWR((key) => true, undefined, {
            revalidate: true,
          });
        },
      });
    }
    const base = `${window.getOpenmrsSpaBase()}home/morgue/patient/${patientUuid}`;
    const to = hasBedInfo
      ? `${base}/compartment/${bedInfo.bedNumber}/${bedInfo.bedId}/mortuary-chart`
      : `${base}/mortuary-chart`;
    navigate({ to });
  };
  const handleDischarge = (patientUuid: string, bedId: number) => {
    if (onDischarge) {
      onDischarge(patientUuid);
    } else {
      launchWorkspace('discharge-body-form', {
        workspaceTitle: t('dischargeForm', 'Discharge form'),
        patientUuid: patientUuid,
        bedId,
        mutate,
      });
    }
  };

  const handleSwapCompartment = (patientUuid: string, bedId: number) => {
    if (onSwapCompartment) {
      onSwapCompartment(patientUuid, bedId.toString());
    } else {
      launchWorkspace('swap-unit-form', {
        workspaceTitle: t('swapCompartment', 'Swap compartment'),
        patientUuid: patientUuid,
        bedId,
        mortuaryLocation: AdmittedDeceasedPatient,
        mutate,
      });
    }
  };

  const calculateDaysAdmitted = (dateOfDeath: string): number => {
    if (!dateOfDeath) {
      return 0;
    }
    const deathDate = new Date(dateOfDeath);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - deathDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

  const getCompartmentShare = useMemo(() => {
    return (patients: any[]) => {
      if (!patients || patients.length === 0) {
        return t('empty', 'Empty');
      }
      return patients.length > 1
        ? t('sharedCompartment', '{{count}} sharing', { count: patients.length })
        : t('singleOccupancy', 'Single');
    };
  }, [t]);

  const getIdNumber = (patient: Patient) => {
    if (!patient?.identifiers) {
      return '-';
    }

    const openmrsIdentifier = patient.identifiers.find(
      (id) =>
        (typeof id.identifierType === 'object' &&
          id.identifierType &&
          'name' in id.identifierType &&
          (id.identifierType as { name?: string }).name === 'OpenMRS ID') ||
        (typeof id.identifierType === 'object' &&
          id.identifierType &&
          'display' in id.identifierType &&
          (id.identifierType as { display?: string }).display === 'OpenMRS ID') ||
        id.display?.includes('OpenMRS ID'),
    );
    return openmrsIdentifier?.identifier || '-';
  };

  const getPatientName = (patient: Person) => {
    if (!patient) {
      return '-';
    }

    if (patient.display) {
      return patient.display;
    }

    return '-';
  };

  const allRows = useMemo(() => {
    if (isLoading) {
      return [];
    }

    const bedLayouts = AdmittedDeceasedPatient?.bedLayouts || [];
    const rows = [];

    for (const bedLayout of bedLayouts) {
      const patients = bedLayout.patients || [];
      const bedNumber = bedLayout.bedNumber;
      const bedId = bedLayout.bedId;
      const bedUuid = bedLayout.bedUuid;
      const bedStatus = bedLayout.status;
      const bedType = bedLayout.bedType?.displayName || '-';
      const compartmentShare = getCompartmentShare(patients);

      if (patients.length === 0) {
        rows.push({
          id: bedUuid || `empty-bed-${bedId}`,
          bedNumber,
          compartmentShare,
          bedType,
          status: bedStatus,
          patientName: '-',
          idNumber: '-',
          gender: '-',
          age: '-',
          dateOfDeath: '-',
          causeOfDeath: '-',
          daysAdmitted: '-',
          isEmpty: true,
          bedId,
          searchableText: `${bedNumber} ${bedType}`.toLowerCase(),
        });
      } else {
        for (const patient of patients) {
          const patientUuid = patient.uuid;
          const patientName = getPatientName(patient.person);
          const gender = patient.person?.gender || '-';
          const age = patient.person?.age?.toString() || '-';
          const causeOfDeath = patient.person?.causeOfDeath?.display || t('unknown', 'Unknown');
          const dateOfDeath = patient.person?.deathDate;
          const daysAdmitted = calculateDaysAdmitted(dateOfDeath).toString();
          const idNumber = getIdNumber(patient);

          rows.push({
            id: `${bedUuid}-${patientUuid}`,
            bedNumber,
            compartmentShare,
            bedType,
            status: bedStatus,
            patientName,
            idNumber,
            gender,
            age,
            dateOfDeath: formatDateTime(dateOfDeath),
            causeOfDeath,
            daysAdmitted,
            isEmpty: false,
            patientUuid,
            bedUuid,
            bedId,
            personUuid: patient.person?.uuid || '',
            searchableText: `${patientName} ${idNumber} ${gender} ${bedNumber} ${bedType}`.toLowerCase(),
          });
        }
      }
    }

    return rows;
  }, [getCompartmentShare, AdmittedDeceasedPatient, t, isLoading]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) {
      return allRows;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return allRows.filter(
      (row) =>
        row.searchableText.includes(searchLower) ||
        row.patientName.toLowerCase().includes(searchLower) ||
        row.idNumber.toLowerCase().includes(searchLower) ||
        row.gender.toLowerCase().includes(searchLower) ||
        row.bedNumber?.toString().includes(searchLower) ||
        row.bedType.toLowerCase().includes(searchLower),
    );
  }, [allRows, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const hasSearchTerm = searchTerm.trim().length > 0;
  const hasNoSearchResults = hasSearchTerm && filteredRows.length === 0;
  const totalCount = filteredRows.length;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <DataTableSkeleton columnCount={headers.length} rowCount={5} zebra />
      </div>
    );
  }

  if (!AdmittedDeceasedPatient) {
    return (
      <div>
        <EmptyMorgueAdmission title={t('noAdmittedPatient', 'No deceased patients currently admitted')} />
      </div>
    );
  }

  const startIndex = (currentPage - 1) * currPageSize;
  const endIndex = startIndex + currPageSize;
  const paginatedRows = paginated ? filteredRows.slice(startIndex, endIndex) : filteredRows;

  const goTo = (page: number) => setCurrentPage(page);

  const handlePaginationChange = ({ page: newPage, pageSize }: { page: number; pageSize: number }) => {
    if (newPage !== currentPage) {
      goTo(newPage);
    }
    if (pageSize !== currPageSize) {
      setCurrPageSize(pageSize);
      setCurrentPage(1);
    }
  };

  const NoSearchResults = () => (
    <div className={styles.emptyState}>
      <EmptyMorgueAdmission title={t('noSearchResults', 'We couldn’t find anything')} />
    </div>
  );

  return (
    <div className={styles.bedLayoutWrapper}>
      <div className={styles.searchContainer}>
        <Search
          labelText={t('noSearchDeceasedPatients', 'Search deceased patients')}
          placeholder={t('searchPatientsPlaceholder', 'Search by name, ID number, gender, compartment, or bed type...')}
          value={searchTerm}
          onChange={handleSearchChange}
          size={controlSize}
        />
      </div>
      {hasNoSearchResults ? (
        <NoSearchResults />
      ) : (
        <>
          <DataTable rows={paginatedRows} headers={headers} isSortable useZebraStyles>
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
              <TableContainer>
                <Table {...getTableProps()} aria-label="mortuary beds table">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader key={header.key} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const rowData = allRows.find((r) => r.id === row.id);
                      if (!rowData) {
                        return null;
                      }

                      return (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => {
                            const cellKey = cell.info.header as keyof typeof rowData;

                            if (cell.info.header === 'daysAdmitted' && !rowData.isEmpty) {
                              return (
                                <TableCell key={cell.id}>
                                  <DaysInMortuary patientUuid={rowData.patientUuid} />
                                </TableCell>
                              );
                            }

                            if (cell.info.header === 'admissionDate' && !rowData.isEmpty) {
                              return (
                                <TableCell key={cell.id}>
                                  <AdmissionDate patientUuid={rowData.patientUuid} />
                                </TableCell>
                              );
                            }

                            if (cell.info.header === 'status') {
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type={rowData.status === 'AVAILABLE' ? 'green' : 'red'} size="sm">
                                    {rowData.status === 'AVAILABLE'
                                      ? t('available', 'Available')
                                      : t('occupied', 'Occupied')}
                                  </Tag>
                                </TableCell>
                              );
                            }

                            if (cell.info.header === 'action') {
                              return (
                                <TableCell key={cell.id}>
                                  {!rowData.isEmpty && (
                                    <OverflowMenu flipped>
                                      <OverflowMenuItem
                                        onClick={() => {
                                          const hasBedInfo = rowData.bedNumber && rowData.bedId;
                                          const base = `${window.getOpenmrsSpaBase()}home/morgue/patient/${
                                            rowData.patientUuid
                                          }`;
                                          const to = hasBedInfo
                                            ? `${base}/compartment/${rowData.bedNumber}/${rowData.bedId}/mortuary-chart`
                                            : `${base}/mortuary-chart`;
                                          navigate({ to });
                                        }}
                                        itemText={t('viewDetails', 'View details')}
                                      />
                                      <OverflowMenuItem
                                        onClick={() => handlePostmortem(rowData.patientUuid)}
                                        itemText={t('postmortemForm', 'Postmortem')}
                                      />
                                      <OverflowMenuItem
                                        onClick={() => handleSwapCompartment(rowData.patientUuid, rowData.bedId)}
                                        itemText={t('compartmentSwap', 'Compartment swap')}
                                      />
                                      <OverflowMenuItem
                                        onClick={() => handleDischarge(rowData.patientUuid, rowData.bedId)}
                                        itemText={t('dischargeForm', 'Discharge')}
                                      />
                                    </OverflowMenu>
                                  )}
                                </TableCell>
                              );
                            }
                            return <TableCell key={cell.id}>{rowData[cellKey] || '-'}</TableCell>;
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>

          {paginated && !isLoading && totalCount > 0 && (
            <Pagination
              page={currentPage}
              pageSize={currPageSize}
              pageSizes={pageSizes}
              totalItems={totalCount}
              size={'sm'}
              onChange={handlePaginationChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdmittedBedLineListView;
