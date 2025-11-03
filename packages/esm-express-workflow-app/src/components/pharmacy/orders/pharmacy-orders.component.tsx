import React, { ChangeEvent, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbarSearch,
  Button,
  DataTableSkeleton,
  Pagination,
} from '@carbon/react';
import { Add, Renew } from '@carbon/react/icons';
import { ErrorState, formatDatetime, parseDate, useDebounce, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState, useLaunchWorkspaceRequiringVisit, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import capitalize from 'lodash-es/capitalize';

import { usePharmacyOrders } from './pharmacy-orders.resource';

import styles from './pharmacy-orders.scss';

type PharmacyOrdersProps = {
  patient: fhir.Patient;
};

const PharmacyOrders: React.FC<PharmacyOrdersProps> = ({ patient }) => {
  const { t } = useTranslation();
  const responseSize = useLayoutType() === 'tablet' ? 'md' : 'sm';
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { medicationRequests, isLoading, error, mutate, currentPage, goTo, totalCount, currPageSize, setCurrPageSize } =
    usePharmacyOrders(patient.identifier[0]?.value ?? '', debouncedSearchTerm);
  const launchAddDrugOrder = useLaunchWorkspaceRequiringVisit('add-drug-order');

  const currentItems = useMemo(() => {
    return medicationRequests.length;
  }, [medicationRequests]);

  const { pageSizes, itemsDisplayed } = usePaginationInfo(
    currPageSize,
    totalCount || 0,
    currentPage || 1,
    currentItems,
  );

  const header = [
    { key: 'date', header: t('dateAndTime', 'Date and time') },
    { key: 'medication', header: t('medication', 'Medication') },
    { key: 'quantity', header: t('quantity', 'Quantity') },
    { key: 'requester', header: t('requester', 'Requester') },
    { key: 'status', header: t('status', 'Status') },
  ];

  const rows = medicationRequests.map((medicationRequest) => {
    const resource = medicationRequest.resource as fhir.MedicationRequest;
    return {
      id: medicationRequest.fullUrl,
      date: formatDatetime(parseDate(resource?.authoredOn), { mode: 'standard', noToday: true }),
      medication: resource?.medicationReference?.display,
      quantity: resource?.dispenseRequest?.quantity?.value,
      requester: (resource?.requester as fhir.Reference)?.display,
      status: capitalize(resource?.status),
    };
  });

  if (isLoading) {
    return (
      <div className={styles.pharmacyOrdersContainer}>
        <DataTableSkeleton columnCount={header.length} showHeader={false} showToolbar={false} zebra />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pharmacyOrdersContainer}>
        <ErrorState headerTitle={t('errorLoadingMedicationOrders', 'Error loading medication orders')} error={error} />
      </div>
    );
  }

  if (rows.length === 0 && !isLoading) {
    return (
      <div className={styles.pharmacyOrdersContainer}>
        <EmptyState
          displayText={t('noMedicationOrdersFound', 'No medication orders found')}
          headerTitle={t('noMedicationOrders', 'No medication orders')}
          launchForm={launchAddDrugOrder}
        />
      </div>
    );
  }

  return (
    <div className={styles.pharmacyOrdersContainer}>
      <DataTable useZebraStyles size={responseSize} rows={rows} headers={header} isSortable>
        {({ rows, headers, getHeaderProps, getTableProps, getToolbarProps }) => (
          <TableContainer
            title={t('pendingMedicationOrders', 'Pending Medication Orders')}
            description={t(
              'pharmacyOrdersDescription',
              'Active medication prescriptions awaiting pharmacist review and dispensing',
            )}>
            <TableToolbar {...getToolbarProps()}>
              <TableToolbarContent>
                <TableToolbarSearch
                  persistent
                  onChange={(evt: ChangeEvent<HTMLInputElement>) => setSearchTerm(evt.target.value)}
                  placeholder={t('searchMedicationOrders', 'Search medication orders')}
                  value={searchTerm}
                />
                <Button kind="ghost" renderIcon={Renew} size={responseSize} onClick={() => mutate()}>
                  {t('refresh', 'Refresh')}
                </Button>
                <Button size={responseSize} onClick={() => launchAddDrugOrder()} kind="ghost" renderIcon={Add}>
                  {t('addMedicationOrder', 'Add Medication Order')}
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
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
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalCount > 0 && (
              <Pagination
                page={currentPage}
                pageSize={currPageSize}
                pageSizes={pageSizes}
                totalItems={totalCount}
                onChange={({ page, pageSize }) => {
                  if (pageSize !== currPageSize) {
                    setCurrPageSize(pageSize);
                  }
                  goTo(page);
                }}
                size={responseSize}
              />
            )}
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default PharmacyOrders;
