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
  ConfigurableLink,
  ErrorState,
  UserHasAccess,
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
import { usePharmacyPatients } from '../hooks';
import { revokePharamacyAssignment } from '../pharmacy.resources';
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

  const launchDeleteModal = (patientUuid: string) => {
    const dispose = showModal('pharmacy-delete-confirm-dialog', {
      onDelete: () => {
        handleRevoke(patientUuid);
        dispose();
      },
      onClose: () => dispose(),
    });
  };

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
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const tableRows =
    results?.map((patient) => {
      return {
        id: `${patient.uuid}`,
        openmrsId: patient.openmrsId,
        name: (
          <ConfigurableLink
            style={{ textDecoration: 'none' }}
            to={window.getOpenmrsSpaBase() + `patient/${patient.uuid}/chart/Patient Summary`}>
            {patient.name}
          </ConfigurableLink>
        ),
        age: patient.age ?? '--',
        sex: patient.gender ?? '--',
        contact: patient.telephoneContact ?? '--',
        dateMapped: patient.dateMapped,
        actions: (
          <UserHasAccess privilege={'coreapps.systemAdministration'} fallback={`--`}>
            <Button
              kind="tertiary"
              renderIcon={TrashCan}
              onClick={() => {
                launchDeleteModal(patient.uuid);
              }}>
              Revoke
            </Button>
          </UserHasAccess>
        ),
      };
    }) ?? [];

  const handdleAssignToPharmacy = () => {
    launchWorkspace('pharmacy-assignment-form', {
      workspaceTitle: 'Pharmacy Assignment Form',
      pharmacyUuid,
      type: 'org.openmrs.Patient',
    });
  };

  const handleRevoke = async (patientUuid: string) => {
    try {
      const results = await revokePharamacyAssignment({
        entityIdentifier: patientUuid,
        basisIdentifier: pharmacyUuid,
        entityType: 'org.openmrs.Patient',
        basisType: 'org.openmrs.Location',
      });
      showSnackbar({ kind: 'success', subtitle: results, title: 'Success' });

      mutate((key) => {
        return typeof key === 'string' && key.startsWith(`/ws/rest/v1/datafilter/search?type=org.openmrs.Patient`);
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

  if (patients.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>{t('noPharmacyPatients', 'No Pharmacy Patients to list.')}</p>
          <UserHasAccess privilege={'coreapps.systemAdministration'}>
            <Button onClick={handdleAssignToPharmacy} renderIcon={Add} kind="ghost">
              {t('assignPatient', 'Assign Patient')}
            </Button>
          </UserHasAccess>
        </Tile>
      </Layer>
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>
        <UserHasAccess privilege={'coreapps.systemAdministration'}>
          <Button onClick={handdleAssignToPharmacy} renderIcon={Add} kind="ghost">
            {t('assignPatient', 'Assign Patient')}
          </Button>
        </UserHasAccess>
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
