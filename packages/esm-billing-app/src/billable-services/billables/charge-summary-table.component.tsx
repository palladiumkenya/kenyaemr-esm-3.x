import React, { useState } from 'react';
import { UseChargeSummaries } from './charge-summary.resource';
import {
  DataTable,
  DataTableSkeleton,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  InlineLoading,
  OverflowMenu,
  OverflowMenuItem,
  ComboButton,
  MenuItem,
} from '@carbon/react';
import { ErrorState, launchWorkspace, showModal, usePagination } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './charge-summary-table.scss';
import { EmptyState, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { convertToCurrency } from '../../helpers';

const defaultPageSize = 10;

const ChargeSummaryTable: React.FC = () => {
  const { t } = useTranslation();
  const size = 'sm';
  const { isLoading, isValidating, error, mutate, chargeSummaryItems } = UseChargeSummaries();
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const { results, goTo, currentPage } = usePagination(chargeSummaryItems, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, chargeSummaryItems.length, currentPage, results.length);

  const headers = [
    {
      key: 'name',
      header: t('name', 'Name'),
    },
    {
      key: 'shortName',
      header: t('shortName', 'Short Name'),
    },
    {
      key: 'serviceStatus',
      header: t('status', 'Status'),
    },
    {
      key: 'serviceType',
      header: t('type', 'Type'),
    },
    {
      key: 'servicePrices',
      header: t('prices', 'Prices'),
    },
  ];

  const rows = results.map((service) => {
    return {
      id: service.uuid,
      name: service.name,
      shortName: service.shortName,
      serviceStatus: service.serviceStatus,
      serviceType: service?.serviceType?.display ?? t('stockItem', 'Stock Item'),
      servicePrices: service.servicePrices
        .map((price) => `${price.name} : ${convertToCurrency(price.price)}`)
        .join(', '),
    };
  });

  // TODO: Implement handleDelete
  const handleDelete = (service) => {};

  const handleEdit = (service) => {
    Boolean(service?.serviceType?.display)
      ? launchWorkspace('billable-service-form', { initialValues: service })
      : launchWorkspace('commodity-form', { initialValues: service });
  };

  if (isLoading) {
    return <DataTableSkeleton headers={headers} aria-label="sample table" />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('billableServicesError', 'Billable services error')} />;
  }

  if (!chargeSummaryItems.length) {
    return (
      <EmptyState
        headerTitle={t('clinicalCharges', 'Medical Invoice Items')}
        launchForm={() => launchWorkspace('billable-service-form')}
        displayText={t('clinicalChargesDescription', 'Billable services and consumable prices')}
      />
    );
  }

  return (
    <>
      <DataTable size={size} useZebraStyles rows={rows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getToolbarProps,
          onInputChange,
          getTableContainerProps,
        }) => (
          <TableContainer
            className={styles.tableContainer}
            title={t('clinicalCharges', 'Medical Invoice Items')}
            description={t('clinicalChargesDescription', 'Billable services and consumable prices')}
            {...getTableContainerProps()}>
            <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
              <TableToolbarContent>
                <TableToolbarSearch
                  placeHolder={t('searchForBillableService', 'Search for billable service')}
                  onChange={onInputChange}
                  persistent
                  size={size}
                />
                {isValidating && (
                  <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
                )}
                <ComboButton label={t('actions', 'Action')}>
                  <MenuItem
                    onClick={() => launchWorkspace('billable-service-form')}
                    label={t('addService', 'Add service')}
                  />
                  <MenuItem
                    onClick={() => launchWorkspace('commodity-form')}
                    label={t('addCommodity', 'Add commodity')}
                  />
                </ComboButton>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} aria-label={t('billableService', 'Billable services table')}>
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
                  <TableHeader aria-label={t('overflowMenu', 'Overflow menu')} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    {...getRowProps({
                      row,
                    })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                    <TableCell className="cds--table-column-menu">
                      <OverflowMenu size={size} flipped>
                        <OverflowMenuItem itemText={t('edit', 'Edit')} onClick={() => handleEdit(results[index])} />
                      </OverflowMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <Pagination
        backwardText={t('previousPage', 'Previous page')}
        forwardText={t('nextPage', 'Next page')}
        itemsPerPageText={t('itemsPerPage', 'Items per page')}
        onChange={({ page, pageSize }) => {
          setPageSize(pageSize);
          goTo(page);
        }}
        page={currentPage}
        pageSize={pageSize}
        pageSizes={pageSizes}
        size="sm"
        totalItems={chargeSummaryItems.length}
      />
    </>
  );
};

export default ChargeSummaryTable;
