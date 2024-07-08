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
import {
  ConfigurableLink,
  ErrorState,
  isDesktop,
  useLayoutType,
  usePagination,
  useSession,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserMappedPharmacies } from '../hooks';
import styles from './pharmacy-tables.scss';

const PharmaciesTable = () => {
  const { t } = useTranslation();
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);
  const {
    user: { uuid: sessionUserUuid },
  } = useSession();
  const { error, pharmacies, isLoading } = useUserMappedPharmacies(sessionUserUuid);

  const headerTitle = t('communityPharmacies', 'Community pharmacies');

  const [pageSize, setPageSize] = useState(10);

  const { results, totalPages, currentPage, goTo } = usePagination(pharmacies, pageSize);
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
    {
      header: t('cityVillage', 'City village'),
      key: 'cityVillage',
    },
    {
      header: t('stateProvince', 'State province'),
      key: 'stateProvince',
    },
    {
      header: t('countyDistrict', 'County District'),
      key: 'countyDistrict',
    },
  ];

  const tableRows =
    results?.map((pharmacy) => {
      return {
        id: `${pharmacy.uuid}`,
        name: (
          <ConfigurableLink
            to={window.getOpenmrsSpaBase() + `home/pharmacy/${pharmacy.uuid}`}
            style={{ textDecoration: 'none' }}>
            {pharmacy.name}
          </ConfigurableLink>
        ),
        description: pharmacy.description ?? '--',
        cityVillage: pharmacy.cityVillage ?? '--',
        stateProvince: pharmacy.stateProvince ?? '--',
        countyDistrict: pharmacy.countyDistrict ?? '--',
        dateMapped: pharmacy.dateMaped,
      };
    }) ?? [];

  const handdleTagPharmacy = () => {};

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (pharmacies.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>{t('noCommunityPharmacyToList', 'No Community Pharmacies to list.')}</p>
        </Tile>
      </Layer>
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={`Community Pharmacies (${pharmacies.length})`}>
        <div />
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
        totalItems={pharmacies.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default PharmaciesTable;
