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
} from '@carbon/react';
import styles from '../bed-linelist-view.scss';
import { convertDateToDays, formatDateTime } from '../../utils/utils';
import { Patient, Person, type MortuaryLocationResponse } from '../../typess';
import { useVisit } from '@openmrs/esm-framework';

interface AdmittedBedLineListViewProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  paginated?: boolean;
  initialPageSize?: number;
  pageSizes?: number[];
}

const AdmittedBedLineListView: React.FC<AdmittedBedLineListViewProps> = ({
  AdmittedDeceasedPatient,
  isLoading,
  paginated = true,
  initialPageSize = 10,
  pageSizes = [10, 20, 30, 40, 50],
}) => {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [currPageSize, setCurrPageSize] = useState(initialPageSize);

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

  const calculateDaysAdmitted = (dateOfDeath: string): number => {
    if (!dateOfDeath) {
      return 0;
    }
    const deathDate = new Date(dateOfDeath);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - deathDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

  const getCompartmentShare = (patients: any[]) => {
    if (!patients || patients.length === 0) {
      return t('empty', 'Empty');
    }
    return patients.length > 1
      ? t('sharedCompartment', '{{count}} sharing', { count: patients.length })
      : t('singleOccupancy', 'Single');
  };

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

          rows.push({
            id: `${bedUuid}-${patientUuid}`,
            bedNumber,
            compartmentShare,
            bedType,
            status: bedStatus,
            patientName,
            idNumber: getIdNumber(patient),
            gender,
            age,
            dateOfDeath: formatDateTime(dateOfDeath),
            causeOfDeath,
            daysAdmitted,
            isEmpty: false,
            patientUuid,
            bedUuid,
          });
        }
      }
    }

    return rows;
  }, [AdmittedDeceasedPatient, getCompartmentShare, t, isLoading]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <DataTableSkeleton columnCount={headers.length} rowCount={5} zebra />
      </div>
    );
  }

  if (!AdmittedDeceasedPatient) {
    return (
      <div className={styles.loadingContainer}>
        <DataTableSkeleton columnCount={headers.length} rowCount={5} zebra />
      </div>
    );
  }

  const totalCount = allRows.length;
  const startIndex = (currentPage - 1) * currPageSize;
  const endIndex = startIndex + currPageSize;
  const paginatedRows = paginated ? allRows.slice(startIndex, endIndex) : allRows;

  const handleDischarge = (patientUuid: string, patientName: string) => {
    // Implement discharge logic
  };

  const handleAssignBed = (bedUuid: string, bedNumber: string) => {
    // Implement bed assignment logic
  };

  const handleEditPatient = (patientUuid: string) => {
    // Implement edit patient logic
  };

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

  return (
    <div className={styles.bedLayoutWrapper}>
      <DataTable rows={paginatedRows} headers={headers} isSortable useZebraStyles>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
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
                              <OverflowMenu flipped>
                                {rowData.isEmpty ? (
                                  <OverflowMenuItem
                                    onClick={() => handleAssignBed(rowData.bedUuid, rowData.bedNumber)}
                                    itemText={t('assignBed', 'Assign Bed')}
                                  />
                                ) : (
                                  <>
                                    <OverflowMenuItem
                                      onClick={() => handleEditPatient(rowData.patientUuid)}
                                      itemText={t('edit', 'Edit')}
                                    />
                                    <OverflowMenuItem
                                      onClick={() => handleDischarge(rowData.patientUuid, rowData.patientName)}
                                      itemText={t('discharge', 'Discharge')}
                                    />
                                  </>
                                )}
                              </OverflowMenu>
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
    </div>
  );
};

export default AdmittedBedLineListView;
