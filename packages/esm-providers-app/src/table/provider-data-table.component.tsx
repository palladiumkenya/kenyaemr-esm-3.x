import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTableSkeleton,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Pagination,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Search,
  Dropdown,
} from '@carbon/react';
import { isDesktop, useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { ErrorState, CardHeader, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import styles from './generic-data-table.scss';
import { useProviders } from './provider-data-table.resource';
import ProviderDetails from './provider-details.component';
import { ConfigObject } from '../config-schema';
import dayjs from 'dayjs';
import CustomActionMenu from '../overflow/overflow-component';
import EmptyProviderState from './empty-state.component';
import { Report } from '@carbon/react/icons';

type FilterType = 'All Providers' | 'Active Licensed' | 'Expired Licensed' | 'Licensed expiring soon' | 'Unlicensed';

const getCardTitle = (filterName: FilterType): string => {
  const filterMap: Record<FilterType, string> = {
    'All Providers': 'List of all providers',
    'Active Licensed': 'List of active licensed providers',
    'Expired Licensed': 'List of expired licensed providers',
    'Licensed expiring soon': 'List of licensed expiring soon providers',
    Unlicensed: 'List of unlicensed providers',
  };
  return filterMap[filterName] || 'List of providers';
};

const ProviderListTable: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { provider, error, isLoading } = useProviders();
  const { licenseNumberUuid, licenseExpiryDateUuid, providerNationalIdUuid } = useConfig<ConfigObject>();
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All Providers');

  const isActiveLicensed = (provider) => {
    const licenseAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
    const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
    const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;
    return licenseAttr && licenseExpiryDate && licenseExpiryDate.isAfter(dayjs());
  };

  const isExpiredLicensed = (provider) => {
    const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
    const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;
    return licenseExpiryDate && licenseExpiryDate.isBefore(dayjs());
  };

  const isExpiringSoon = (provider) => {
    const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
    const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;
    const today = dayjs();
    return (
      licenseExpiryDate &&
      licenseExpiryDate.isAfter(today) &&
      licenseExpiryDate.diff(today, 'day') > 0 &&
      licenseExpiryDate.diff(today, 'day') <= 3
    );
  };

  const isUnlicensed = (provider) => {
    const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
    return !nationalId;
  };

  const filteredProviders = Array.isArray(provider)
    ? provider.filter((p) => {
        const matchesSearch = p.person.display.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
          selectedFilter === 'All Providers' ||
          (selectedFilter === 'Active Licensed' && isActiveLicensed(p)) ||
          (selectedFilter === 'Expired Licensed' && isExpiredLicensed(p)) ||
          (selectedFilter === 'Licensed expiring soon' && isExpiringSoon(p)) ||
          (selectedFilter === 'Unlicensed' && isUnlicensed(p));

        return matchesSearch && matchesFilter;
      })
    : [];

  const { paginated, goTo, results, currentPage } = usePagination(filteredProviders, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, filteredProviders.length, currentPage, results?.length);

  const headerData = [
    { header: t('name', 'Name'), key: 'name' },
    { header: t('license', 'License Number'), key: 'license' },
    { header: t('action', 'Action'), key: 'action' },
  ];

  const rowData = results.map((provider) => {
    const licenseAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
    return {
      id: provider.uuid,
      name: provider.person.display,
      license: licenseAttr ? licenseAttr?.value : '--',
      action: <CustomActionMenu provider={provider} />,
      providerUuid: provider?.uuid,
    };
  });

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton showHeader={false} showToolbar={false} zebra size={responsiveSize} />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('noHealthWorkerFound', 'No Health worker found')} />;
  }

  return (
    <div className={styles.Container}>
      <div className={styles.providerContainer}>
        <CardHeader
          title={`${t(getCardTitle(selectedFilter), { count: filteredProviders.length })} (${
            filteredProviders.length
          })`}>
          <Dropdown
            className={styles.dropDown}
            initialSelectedItem={{ text: 'All Providers' }}
            itemToString={(item) => item.text}
            items={[
              { text: 'All Providers' },
              { text: 'Active Licensed' },
              { text: 'Expired Licensed' },
              { text: 'Licensed expiring soon' },
              { text: 'Unlicensed' },
            ]}
            onChange={({ selectedItem }) => setSelectedFilter((selectedItem?.text as FilterType) || 'All Providers')}
          />
        </CardHeader>

        <Search
          labelText=""
          placeholder={t('searchProvider', 'Search for provider')}
          onChange={(e) => setSearchQuery(e.target.value)}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          value={searchQuery}
        />

        {filteredProviders.length === 0 ? (
          <EmptyProviderState
            title={t('noProvidersAvailable', 'No providers available')}
            subTitle={t('adjustFilterOrSwitch', 'Try adjusting your search or switch to a different category above.')}
            icon={<Report className={styles.iconOverrides} />}
          />
        ) : (
          <DataTable isSortable rows={rowData} headers={headerData} size={responsiveSize} useZebraStyles>
            {({
              rows,
              headers,
              getExpandHeaderProps,
              getTableProps,
              getTableContainerProps,
              getHeaderProps,
              getRowProps,
            }) => (
              <TableContainer {...getTableContainerProps()}>
                <Table className={styles.table} {...getTableProps()} aria-label="Provider list">
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                      {headers.map((header, i) => (
                        <TableHeader key={i} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, i) => (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        {row && row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
                            <div className={styles.container} key={i}>
                              <ProviderDetails providerUuid={row.id} />
                            </div>
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        )}

        {paginated && (
          <Pagination
            forwardText={t('nextPage', 'Next page')}
            backwardText={t('previousPage', 'Previous page')}
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={filteredProviders.length}
            className={styles.pagination}
            size={responsiveSize}
            onChange={({ page: newPage, pageSize }) => {
              if (newPage !== currentPage) {
                goTo(newPage);
              }
              setPageSize(pageSize);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProviderListTable;
