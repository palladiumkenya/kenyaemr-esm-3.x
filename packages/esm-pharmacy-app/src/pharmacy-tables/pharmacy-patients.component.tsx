import {
  Button,
  DataTable,
  DataTableSkeleton,
  Layer,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ErrorState, isDesktop, launchWorkspace, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePharmacyPatients } from '../hooks';
import styles from './pharmacy-tables.scss';

export const PharmacyPatients: React.FC = () => {
  const { pharmacyUuid } = useParams();
  const { t } = useTranslation();
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);
  const { error, patients, isLoading } = usePharmacyPatients(pharmacyUuid);
  const headerTitle = t('pharmacyPatients', 'Pharmacy Patients');

  const [pageSize, setPageSize] = useState(10);

  const { results, totalPages, currentPage, goTo } = usePagination(patients, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);
  const layout = useLayoutType();

  const headers = [
    {
      header: t('openmrsId', 'OpenMRS ID'),
      key: 'openmrsId',
    },
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('age', 'Age'),
      key: 'age',
    },
    {
      header: t('sex', 'Sex'),
      key: 'sex',
    },
    {
      header: t('contact', 'Contact'),
      key: 'contact',
    },
    {
      header: t('dateMapped', 'Date Mapped'),
      key: 'dateMapped',
    },
  ];

  const tableRows =
    results?.map((patient) => {
      return {
        id: `${patient.uuid}`,
        openmrsId: patient.openmrsId,
        name: patient.name,
        age: patient.age ?? '--',
        sex: patient.gender ?? '--',
        contact: patient.telephoneContact ?? '--',
        dateMapped: patient.dateMapped,
      };
    }) ?? [];

  const handdleAssignToPharmacy = () => {
    launchWorkspace('pharmacy-assignment-form', {
      workspaceTitle: 'Pharmacy Assignment Form',
      pharmacyUuid,
      type: 'org.openmrs.Patient',
    });
  };

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (patients.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>{t('noPharmacyPatients', 'No Pharmacy Patients to list.')}</p>
          <Button onClick={handdleAssignToPharmacy} renderIcon={Add} kind="ghost">
            {t('assignPatient', 'Assign Patient')}
          </Button>
        </Tile>
      </Layer>
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>
        <Button onClick={handdleAssignToPharmacy} renderIcon={Add} kind="ghost">
          {t('assignPatient', 'Assign Patient')}
        </Button>
      </CardHeader>
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows ?? []}
        headers={headers}
        render={({ rows, headers, getHeaderProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
      <Pagination
        page={currentPage}
        pageSize={pageSize}
        pageSizes={pageSizes}
        totalItems={patients.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};
