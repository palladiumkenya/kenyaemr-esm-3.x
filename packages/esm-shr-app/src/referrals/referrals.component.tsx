import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  DataTable,
  InlineLoading,
  Layer,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  DataTableSkeleton,
  Link,
} from '@carbon/react';
import { useLayoutType, isDesktop, usePagination, navigate } from '@openmrs/esm-framework';
import styles from '../referrals/referral-tabs/referrals-tabs.scss';
import { useTranslation } from 'react-i18next';
import { useCommunityReferrals } from './refferals.resource';
import CommunityReferralActions from './referrals-actions.component';
import { ReferralReasonsProps } from '../types';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib/src';

type ReferralProps = {
  status: string;
};

const DEFAULT_PAGE_SIZE = 10;

const ReferralTable: React.FC<ReferralProps> = ({ status }) => {
  const { t } = useTranslation();
  const { referrals, isLoading, isValidating } = useCommunityReferrals(status);
  const layout = useLayoutType();
  const [searchString, setSearchString] = useState('');
  const responsiveSize = isDesktop(layout) ? 'lg' : 'sm';
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { pageSizes } = usePaginationInfo(pageSize, referrals?.length, 1, referrals?.length);

  const setName = (record: any) => {
    return record.givenName + ' ' + record.middleName + ' ' + record.familyName;
  };

  const headerData = [
    {
      header: t('nupi', 'UPI'),
      key: 'nupi',
    },
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('gender', 'Gender'),
      key: 'gender',
    },
    {
      header: t('birthdate', 'Date of birth'),
      key: 'birthdate',
    },
    {
      header: t('dateReferred', 'Date Referred'),
      key: 'dateReferred',
    },
    {
      header: t('referredFrom', 'Referred From'),
      key: 'referredFrom',
    },
    {
      header: t('referralService', 'Department'),
      key: 'referralService',
    },
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const searchResults = useMemo(() => {
    if (referrals !== undefined && referrals.length > 0) {
      if (searchString && searchString.trim() !== '') {
        const search = searchString.toLowerCase();
        return referrals?.filter((service) =>
          Object.entries(service).some(([header, value]) => {
            return header === 'uuid' ? false : `${value}`.toLowerCase().includes(search);
          }),
        );
      }
    }
    return referrals;
  }, [searchString, referrals]);

  const { paginated, goTo, results, currentPage } = usePagination(searchResults, pageSize);

  let rowData = [];
  if (results) {
    results.forEach((record, index) => {
      const referralReasonsx: ReferralReasonsProps = {
        clinicalNote: record.referralReasons?.clinicalNote,
        reasonCode: record.referralReasons?.reasonCode,
        messageId: record.id,
        category: '',
      };
      const s = {
        id: `${index}`,
        uuid: record.uuid,
        nupi: record.nupi,
        name:
          status === 'active' ? (
            setName(record)
          ) : (
            <Link
              onClick={() =>
                navigate({ to: window.getOpenmrsSpaBase() + `patient/${record?.uuid}/chart/Patient Summary` })
              }>
              {setName(record)}
            </Link>
          ),
        gender: record.gender,
        birthdate: record.birthdate,
        dateReferred: record.dateReferred,
        referredFrom: record.referredFrom,
        referralService: record.referralReasons?.category,
        actions: <CommunityReferralActions status={status} referralData={referralReasonsx} />,
      };
      rowData.push(s);
    });
  }

  const handleSearch = useCallback(
    (e) => {
      goTo(1);
      setSearchString(e.target.value);
    },
    [goTo, setSearchString],
  );

  if (isLoading) {
    return <DataTableSkeleton headers={headerData} columnCount={headerData.length} />;
  }

  return (
    <div className={styles.serviceContainer}>
      <FilterableTableHeader
        handleSearch={handleSearch}
        isValidating={isValidating}
        layout={layout}
        responsiveSize={responsiveSize}
        t={t}
      />
      <DataTable
        isSortable
        rows={rowData}
        headers={headerData}
        size={responsiveSize}
        useZebraStyles={rowData?.length > 1 ? true : false}>
        {({ rows, headers, getRowProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()} aria-label="Referred Patients">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    {...getRowProps({
                      row,
                    })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      {searchResults?.length === 0 && (
        <div className={styles.filterEmptyState}>
          <Layer level={0}>
            <Tile className={styles.filterEmptyStateTile}>
              <p className={styles.filterEmptyStateContent}>
                {t('noRecordsToDisplay', 'There are no new referrals to this facility')}
              </p>
            </Tile>
          </Layer>
        </div>
      )}
      {paginated && (
        <Pagination
          forwardText="Next page"
          backwardText="Previous page"
          page={currentPage}
          pageSize={pageSize}
          pageSizes={pageSizes}
          totalItems={searchResults?.length}
          className={styles.pagination}
          size={responsiveSize}
          onChange={({ pageSize: newPageSize, page: newPage }) => {
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize);
            }
            if (newPage !== currentPage) {
              goTo(newPage);
            }
          }}
        />
      )}
    </div>
  );
};

function FilterableTableHeader({ layout, handleSearch, isValidating, responsiveSize, t }) {
  return (
    <>
      <div className={styles.headerContainer}>
        <div
          className={classNames({
            [styles.tabletHeading]: !isDesktop(layout),
            [styles.desktopHeading]: isDesktop(layout),
          })}>
          <h4>{t('referredPatients', 'Referred Patients')}</h4>
        </div>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <Search
          labelText=""
          placeholder={t('filterTable', 'Filter table')}
          onChange={handleSearch}
          size={responsiveSize}
        />
      </div>
    </>
  );
}
export default ReferralTable;
