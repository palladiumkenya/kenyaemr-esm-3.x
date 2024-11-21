import React from 'react';
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
  Tag,
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
import { Report, SearchLocate } from '@carbon/react/icons';

const ProviderListTable: React.FC<{ filter: (provider: any) => boolean }> = ({ filter }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { provider, error, isLoading } = useProviders();
  const { licenseNumberUuid, licenseExpiryDateUuid, providerNationalIdUuid } = useConfig<ConfigObject>();
  const [pageSize, setPageSize] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredProviders = Array.isArray(provider)
    ? provider.filter((p) => filter(p) && p.person.display.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const { paginated, goTo, results, currentPage } = usePagination(filteredProviders, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, filteredProviders.length, currentPage, results?.length);

  const headerData = [
    { header: t('name', 'Name'), key: 'name' },
    { header: t('license', 'License Number'), key: 'license' },
    { header: t('action', 'Action'), key: 'action' },
  ];

  const maskNationalId = (id) => {
    if (id && id.length > 5) {
      const start = id.slice(0, 3);
      const end = id.slice(-3);
      return `${start}***${end}`;
    }
    return id;
  };

  const rowData = results.map((provider, index) => {
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
        <CardHeader title={t('providersAll', 'List of provider')}>
          <></>
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
