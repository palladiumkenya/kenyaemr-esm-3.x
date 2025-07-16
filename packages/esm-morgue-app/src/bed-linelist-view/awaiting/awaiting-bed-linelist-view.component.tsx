// AwaitingBedLineListView.tsx
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
  DataTableSkeleton,
} from '@carbon/react';
import styles from '../bed-linelist-view.scss';
import { formatDateTime } from '../../utils/utils';
import { type MortuaryLocationResponse, type MortuaryPatient } from '../../types';
import { launchWorkspace } from '@openmrs/esm-framework';
import { useAwaitingPatients } from '../../home/home.resource';

interface AwaitingBedLineListViewProps {
  awaitingQueueDeceasedPatients: Array<MortuaryPatient>;
  mortuaryLocation: MortuaryLocationResponse;
  isLoading: boolean;
  paginated?: boolean;
  initialPageSize?: number;
  pageSizes?: number[];
  mutated?: () => void;
}

const AwaitingBedLineListView: React.FC<AwaitingBedLineListViewProps> = ({
  awaitingQueueDeceasedPatients,
  isLoading,
  mortuaryLocation,
  paginated = true,
  initialPageSize = 10,
  pageSizes = [10, 20, 30, 40, 50],
  mutated,
}) => {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [currPageSize, setCurrPageSize] = useState(initialPageSize);

  const trulyAwaitingPatients = useAwaitingPatients(awaitingQueueDeceasedPatients);

  const headers = [
    { key: 'admissionDate', header: t('dateQueued', 'Date Queued') },
    { key: 'idNumber', header: t('idNumber', 'ID Number') },
    { key: 'name', header: t('name', 'Name') },
    { key: 'gender', header: t('gender', 'Gender') },
    { key: 'age', header: t('age', 'Age') },
    { key: 'bedNumber', header: t('compartmentNumber', 'Compartment Number') },
    { key: 'daysAdmitted', header: t('durationOnWard', 'Days In Queue') },
    { key: 'action', header: t('action', 'Action') },
  ];

  const calculateDaysInQueue = (dateOfDeath: string): number => {
    if (!dateOfDeath) {
      return 0;
    }
    const deathDate = new Date(dateOfDeath);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - deathDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

  const allRows = useMemo(() => {
    if (!trulyAwaitingPatients || trulyAwaitingPatients.length === 0) {
      return [];
    }

    const rows = trulyAwaitingPatients.map((mortuaryPatient, index) => {
      const patientUuid = mortuaryPatient?.person?.person?.uuid || `patient-${index}`;
      const patientName = mortuaryPatient?.person?.person?.display || '-';
      const gender = mortuaryPatient?.person?.person?.gender || '-';
      const age = mortuaryPatient?.person?.person?.age || '-';
      const dateOfDeath = mortuaryPatient?.person?.person?.deathDate;
      const daysInQueue = calculateDaysInQueue(dateOfDeath);

      return {
        id: patientUuid,
        admissionDate: formatDateTime(dateOfDeath),
        idNumber:
          mortuaryPatient?.person?.identifiers
            ?.find((id) => id.display?.includes('OpenMRS ID'))
            ?.display?.split('=')?.[1]
            ?.trim() || '-',
        name: patientName,
        gender: gender,
        age: age.toString(),
        bedNumber: '-',
        daysAdmitted: daysInQueue.toString(),
        action: patientUuid,
      };
    });

    return rows;
  }, [trulyAwaitingPatients]);

  const totalCount = allRows.length;
  const startIndex = (currentPage - 1) * currPageSize;
  const endIndex = startIndex + currPageSize;
  const paginatedRows = paginated ? allRows.slice(startIndex, endIndex) : allRows;

  const handleAdmit = (patientData: MortuaryPatient) => {
    launchWorkspace('admit-deceased-person-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
      patientData,
      mortuaryLocation,
      mutated,
    });
  };

  const handleCancel = (patientUuid: string, patientName: string) => {
    // TODO: Implement cancel functionality
  };

  const goTo = (page: number) => {
    setCurrentPage(page);
  };

  const handlePaginationChange = ({ page: newPage, pageSize }: { page: number; pageSize: number }) => {
    if (newPage !== currentPage) {
      goTo(newPage);
    }
    if (pageSize !== currPageSize) {
      setCurrPageSize(pageSize);
      setCurrentPage(1);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <DataTableSkeleton columnCount={headers.length} rowCount={5} />
      </div>
    );
  }

  if (!trulyAwaitingPatients || trulyAwaitingPatients.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{t('noDeceasedPatients', 'No deceased patients awaiting admission')}</p>
      </div>
    );
  }

  return (
    <div className={styles.bedLayoutWrapper}>
      <DataTable rows={paginatedRows} headers={headers} isSortable useZebraStyles>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
          <TableContainer>
            <Table {...getTableProps()} aria-label="deceased patients table">
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
                {rows.map((row) => {
                  const patientData = trulyAwaitingPatients.find((patient) => patient?.person?.person?.uuid === row.id);
                  const patientName = patientData?.person?.person?.display || '';

                  return (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id} {...getCellProps({ cell })}>
                          {cell.info.header === 'action' ? (
                            <div className={styles.actionButtons}>
                              <OverflowMenu flipped>
                                <OverflowMenuItem
                                  onClick={() => handleAdmit(patientData)}
                                  itemText={t('admit', 'Admit')}
                                  disabled={!patientData}
                                />
                                <OverflowMenuItem
                                  onClick={() => handleCancel(row.id, patientName)}
                                  itemText={t('cancel', 'Cancel')}
                                />
                              </OverflowMenu>
                            </div>
                          ) : (
                            cell.value
                          )}
                        </TableCell>
                      ))}
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

export default AwaitingBedLineListView;
