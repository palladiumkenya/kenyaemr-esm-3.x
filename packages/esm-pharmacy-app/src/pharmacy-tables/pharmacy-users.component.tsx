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
import { usePharmacyUsers } from '../hooks';
import styles from './pharmacy-tables.scss';

export const PharmacyUsers: React.FC = () => {
  const { pharmacyUuid } = useParams();
  const { t } = useTranslation();
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);
  const { error, users, isLoading } = usePharmacyUsers(pharmacyUuid);
  const headerTitle = t('pharmacyUsers', 'Pharmacy Users');

  const [pageSize, setPageSize] = useState(10);

  const { results, totalPages, currentPage, goTo } = usePagination(users, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);
  const layout = useLayoutType();

  const headers = [
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('dateMapped', 'Date Mapped'),
      key: 'dateMapped',
    },
  ];

  const tableRows =
    results?.map((user) => {
      return {
        id: `${user.uuid}`,
        name: user.name,
        dateMapped: user.dateMapped,
      };
    }) ?? [];

  const handdleTagPharmacy = () => {
    const handdleAssignToPharmacy = () => {
      launchWorkspace('pharmacy-assignment-form', {
        workspaceTitle: 'Pharmacy Assignment Form',
        pharmacyUuid,
        type: 'org.openmrs.User',
      });
    };
  };

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (users.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>{t('noPharmacyUsers', 'No Pharmacy users to list.')}</p>
          <Button onClick={handdleTagPharmacy} renderIcon={Add} kind="ghost">
            {t('assignUser', 'Assign User')}
          </Button>
        </Tile>
      </Layer>
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>
        <Button onClick={handdleTagPharmacy} renderIcon={Add} kind="ghost">
          {t('assignUser', 'Assign User')}
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
        totalItems={users.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};
