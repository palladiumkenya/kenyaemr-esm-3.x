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
  Button,
  OverflowMenu,
  OverflowMenuItem,
  MenuItemDivider,
  Tag,
} from '@carbon/react';
import { Add, ArrowsVertical } from '@carbon/react/icons';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { ErrorState, CardHeader } from '@openmrs/esm-patient-common-lib';
import styles from './generic-data-table.scss';
import { useProviders } from './provider-data-table.resource';
import ProviderDetails from './provider-details.component';

const ProviderListTable: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { provider, error, isLoading } = useProviders();

  const [pageSize, setPageSize] = React.useState(10);
  const { results, currentPage, goTo } = usePagination(provider, pageSize);

  const headerData = [
    { header: t('id', 'Identifier type'), key: 'id' },
    { header: t('idType', 'Identifier type'), key: 'idType' },
    { header: t('name', 'Name'), key: 'name' },
    { header: t('license', 'License Number'), key: 'license' },
    { header: t('date', 'License expiry date'), key: 'date' },
    { header: t('status', 'Status'), key: 'status' },
    { header: t('action', 'Action'), key: 'action' },
  ];

  const rowData = results.map((provider) => {
    const licenseAttr = provider.attributes.find((attr) => attr.attributeType.display === 'Practising License Number');

    const dateAttr = provider.attributes.find((attr) => attr.attributeType.display === 'License Expiry Date');

    return {
      id: provider.identifier,
      idType: provider.person.uuid,
      name: provider.person.display,
      license: licenseAttr ? licenseAttr?.value : '--',
      date: dateAttr ? dateAttr?.value : '--',
      status: (
        <Tag className="some-class" type="green">
          {t('activeLicense', 'Active')}
        </Tag>
      ),
      action: (
        <OverflowMenu flipped={document?.dir === 'rtl'} aria-label="overflow-menu">
          <OverflowMenuItem itemText="Sync" />
          <MenuItemDivider />

          <OverflowMenuItem itemText="Edit" />
        </OverflowMenu>
      ),
      personUuid: provider.person.uuid,
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
            <TableContainer {...getTableContainerProps}>
              <Table className={styles.table} {...getTableProps()} aria-label="Provider list">
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header, i) => (
                      <TableHeader
                        key={i}
                        {...getHeaderProps({
                          header,
                        })}>
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
                      {row.isExpanded ? (
                        <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
                          <div className={styles.container} key={i}>
                            <ProviderDetails personUuid={row.personUuid} license={row.license} />
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
        <Pagination
          forwardText={t('nextPage', 'Next page')}
          backwardText={t('previousPage', 'Previous page')}
          page={currentPage}
          pageSize={pageSize}
          pageSizes={[5, 10, 20, 50]}
          totalItems={provider.length}
          className={styles.pagination}
          size={responsiveSize}
          onChange={({ page: newPage, pageSize }) => {
            goTo(newPage);
            setPageSize(pageSize);
          }}
        />
      </div>
    </div>
  );
};

export default ProviderListTable;
