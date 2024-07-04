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
import { Add, TrashCan } from '@carbon/react/icons';
import {
  ErrorState,
  isDesktop,
  launchWorkspace,
  showModal,
  showSnackbar,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { usePharmacyUsers } from '../hooks';
import { revokePharamacyAssignment } from '../pharmacy.resources';
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
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const tableRows =
    results?.map((user) => {
      return {
        id: `${user.uuid}`,
        name: user.name,
        dateMapped: user.dateMapped,
        actions: (
          <Button
            kind="tertiary"
            renderIcon={TrashCan}
            onClick={() => {
              const dispose = showModal('pharmacy-delete-confirm-dialog', {
                onDelete: () => {
                  handleRevoke(user.uuid);
                  dispose();
                },
                onClose: () => dispose(),
              });
            }}>
            Revoke
          </Button>
        ),
      };
    }) ?? [];

  const handdleAssignToPharmacy = () => {
    launchWorkspace('pharmacy-assignment-form', {
      workspaceTitle: 'Pharmacy Assignment Form',
      pharmacyUuid,
      type: 'org.openmrs.User',
    });
  };

  const handleRevoke = async (userUuid: string) => {
    try {
      const results = await revokePharamacyAssignment({
        entityIdentifier: userUuid,
        basisIdentifier: pharmacyUuid,
        entityType: 'org.openmrs.User',
        basisType: 'org.openmrs.Location',
      });
      showSnackbar({ kind: 'success', subtitle: results, title: 'Success' });

      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`/ws/rest/v1/datafilter/search?type=org.openmrs.User`);
      });
    } catch (error) {
      showSnackbar({ kind: 'error', subtitle: error.message, title: 'Failure' });
    }
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
          <Button onClick={handdleAssignToPharmacy} renderIcon={Add} kind="ghost">
            {t('assignUser', 'Assign User')}
          </Button>
        </Tile>
      </Layer>
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>
        <Button onClick={handdleAssignToPharmacy} renderIcon={Add} kind="ghost">
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
