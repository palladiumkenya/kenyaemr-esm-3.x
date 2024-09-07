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
import CustomActionMenu from '../overflow/overflow-component';
import { ConfigObject } from '../config-schema';
import dayjs from 'dayjs';

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
    { header: t('serial', 'SNo'), key: 'serial' },
    { header: t('identifier', 'National ID'), key: 'identifier' },
    { header: t('name', 'Name'), key: 'name' },
    { header: t('license', 'License Number'), key: 'license' },
    { header: t('date', 'License expiry date'), key: 'date' },
    { header: t('status', 'Status'), key: 'status' },
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
    const dateAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
    const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);

    const licenseExpiryDate = dateAttr ? dayjs(dateAttr.value) : null;
    const today = dayjs();
    const daysUntilExpiry = licenseExpiryDate ? licenseExpiryDate.diff(today, 'day') : null;

    let statusTag;

    if (!licenseExpiryDate) {
      statusTag = <Tag type="red">{t('missingExpiryDate', 'Missing expiry date')}</Tag>;
    } else if (daysUntilExpiry < 0) {
      statusTag = <Tag type="red">{t('licenseExpired', 'License has expired')}</Tag>;
    } else if (daysUntilExpiry <= 3) {
      statusTag = <Tag type="cyan">{t('licenseExpiringSoon', 'License is expiring soon')}</Tag>;
    } else {
      statusTag = <Tag type="green">{t('activeLicensed', 'Active License')}</Tag>;
    }

    return {
      id: provider.uuid,
      serial: (currentPage - 1) * pageSize + (index + 1),
      identifier: nationalId ? (
        maskNationalId(nationalId?.value)
      ) : (
        <Tag type="red">{t('missingIDno', 'Missing National ID')}</Tag>
      ),
      name: provider.person.display,
      license: licenseAttr ? licenseAttr?.value : <Tag type="magenta">{t('unlicensed', 'Unlicensed')}</Tag>,
      date: licenseExpiryDate ? (
        licenseExpiryDate.format('YYYY-MM-DD')
      ) : (
        <Tag type="magenta">{t('missingExpiryDate', 'Missing expiry date')}</Tag>
      ),
      status: statusTag,
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
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
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
