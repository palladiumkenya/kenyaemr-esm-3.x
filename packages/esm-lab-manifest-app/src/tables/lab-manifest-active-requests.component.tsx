import {
  Button,
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
} from '@carbon/react';
import { Add, ArrowRight } from '@carbon/react/icons';
import { ConfigurableLink, ErrorState, showModal, showNotification, usePagination } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useActiveRequests from '../hooks/useActiveRequests';
import styles from './lab-manifest-table.scss';
import PatientCCCNumbercell from './patient-ccc-no-cell.component';

interface LabManifestActiveRequestsProps {
  manifestUuid: string;
}

const LabManifestActiveRequests: React.FC<LabManifestActiveRequestsProps> = ({ manifestUuid }) => {
  const { error, isLoading, request: request } = useActiveRequests(manifestUuid);

  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const headerTitle = t('activeRequests', 'Active Requests');
  const { results, totalPages, currentPage, goTo } = usePagination(request?.Orders ?? [], pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);
  const headers = [
    {
      header: t('patientName', 'Patient name'),
      key: 'patientName',
    },
    {
      header: t('cccKDODNumber', 'CCC/KDOD Number'),
      key: 'cccKdod',
    },
    {
      header: t('dateRequested', 'Date Requested'),
      key: 'dateRequested',
      isSortable: true,
    },
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const handleAddSelectedToManifest = (
    selected: Array<{
      labManifest: {
        uuid: string;
      };
      order: {
        uuid: string;
      };
      payload: string;
    }>,
  ) => {
    if (selected.length > 0) {
      const orders = request.Orders.filter((order) => selected.some((o) => o.order.uuid === order.orderUuid));
      const dispose = showModal('lab-manifest-order-modal-form', {
        onClose: () => dispose(),
        props: {
          title: selected.length > 1 ? 'Add Multiple Orders To Manifest' : undefined,
          selectedOrders: selected,
          orders,
        },
      });
    }
  };

  const tableRows =
    results?.map((activeRequest) => {
      const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/Patient Summary';
      return {
        id: `${activeRequest.orderUuid}`,
        patientName: activeRequest.patientName ? (
          <ConfigurableLink
            to={patientChartUrl}
            templateParams={{ patientUuid: activeRequest.patientUuid }}
            style={{ textDecoration: 'none' }}>
            {activeRequest.patientName}
          </ConfigurableLink>
        ) : (
          '--'
        ),
        cccKdod: activeRequest.cccKdod?.trim()?.replaceAll(' ', '') ? (
          activeRequest.cccKdod
        ) : activeRequest?.patientUuid ? (
          <PatientCCCNumbercell patientUuid={activeRequest?.patientUuid} />
        ) : (
          '--'
        ),
        dateRequested: activeRequest.dateRequested,
        actions: (
          <Button
            kind="ghost"
            iconDescription={t('addToManifest', 'Add To manifest')}
            renderIcon={Add}
            hasIconOnly
            onClick={() =>
              handleAddSelectedToManifest([
                {
                  labManifest: {
                    uuid: manifestUuid,
                  },
                  order: {
                    uuid: activeRequest.orderUuid,
                  },
                  payload: activeRequest.payload,
                },
              ])
            }>
            Add To manifest
          </Button>
        ),
      };
    }) ?? [];

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if ((request?.Orders ?? []).length === 0) {
    return (
      <EmptyState
        headerTitle={t('activeRequests', 'Active Requests')}
        displayText={t('notLabManifetToDisplay', 'There is no lab manifets data to display.')}
      />
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows ?? []}
        headers={headers}
        render={({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getTableProps,
          getTableContainerProps,
          selectedRows,
        }) => (
          <>
            <CardHeader title={headerTitle}>
              <Button
                onClick={() => {
                  const data = selectedRows.map(({ id }) => ({
                    labManifest: {
                      uuid: manifestUuid,
                    },
                    order: {
                      uuid: id,
                    },
                    payload: request.Orders.find(({ orderUuid }) => orderUuid === id)?.payload ?? '',
                  }));

                  handleAddSelectedToManifest(data);
                }}
                renderIcon={ArrowRight}
                kind="ghost">
                {t('addSelectedSamples', 'Add Selected Samples')}
              </Button>
            </CardHeader>
            <TableContainer {...getTableContainerProps()}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableSelectAll {...getSelectionProps()} />
                    {headers.map((header, i) => (
                      <TableHeader key={i} {...getHeaderProps({ header, isSortable: header.isSortable })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i} {...getRowProps({ row })} onClick={(evt) => {}}>
                      <TableSelectRow {...getSelectionProps({ row })} />
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      />

      <Pagination
        page={currentPage}
        pageSize={pageSize}
        pageSizes={pageSizes}
        totalItems={(request?.Orders ?? []).length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default LabManifestActiveRequests;
