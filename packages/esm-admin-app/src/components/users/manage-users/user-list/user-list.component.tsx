import React, { useMemo, useState, useCallback } from 'react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { UserFollow } from '@carbon/react/icons';
import {
  ErrorState,
  useConfig,
  useLayoutType,
  launchWorkspace,
  WorkspaceContainer,
  isDesktop,
  usePagination,
  showModal,
} from '@openmrs/esm-framework';
import { CardHeader, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ROLE_CATEGORIES } from '../../../../constants';
import EmptyState from '../../../empty-state/empty-state-log.components';
import { useSystemUserRoleConfigSetting } from '../../../hook/useSystemRoleSetting';
import { useProvider, useUsers } from './user-list.resource';
import styles from './user-list.scss';
import { ConfigObject } from '../../../../config-schema';
import { formatDateTime } from '../../../../utils/utils';
import UserDetails from '../user-details/user-details.component';

type FilterType = 'allUsers' | 'activeLicensed' | 'expiredLicensed' | 'licensedExpiringSoon' | 'unlicensed';

const getCardTitle = (filterName: FilterType): string => {
  const filterMap: Record<FilterType, string> = {
    allUsers: 'List of all users',
    activeLicensed: 'List of active licensed users',
    expiredLicensed: 'List of expired licensed users',
    licensedExpiringSoon: 'List of licensed expiring soon users',
    unlicensed: 'List of unlicensed users',
  };
  return filterMap[filterName] || 'List of users';
};

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { users, isLoading: isLoadingUsers, error: usersError } = useUsers();
  const { provider, isLoading, error: providerError } = useProvider();
  const [syncLoading, setSyncLoading] = useState(false);
  const { licenseNumberUuid, licenseExpiryDateUuid, providerNationalIdUuid, licenseBodyUuid, passportNumberUuid } =
    useConfig<ConfigObject>();

  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('allUsers');

  const { rolesConfig, error } = useSystemUserRoleConfigSetting();

  const extractInventoryRoleNames = (rolesConfig) => {
    return rolesConfig.find((category) => category.category === ROLE_CATEGORIES.CORE_INVENTORY)?.roles || [];
  };

  const inventoryRoleNames = extractInventoryRoleNames(rolesConfig);

  const isActiveLicensed = useCallback(
    (provider) => {
      const licenseAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
      const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
      const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;
      return licenseAttr && licenseExpiryDate && licenseExpiryDate.isAfter(dayjs());
    },
    [licenseNumberUuid, licenseExpiryDateUuid],
  );

  const isExpiredLicensed = useCallback(
    (provider) => {
      const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
      const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;
      return licenseExpiryDate && licenseExpiryDate.isBefore(dayjs());
    },
    [licenseExpiryDateUuid],
  );

  const isExpiringSoon = useCallback(
    (provider) => {
      const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
      const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;
      const today = dayjs();
      return (
        licenseExpiryDate &&
        licenseExpiryDate.isAfter(today) &&
        licenseExpiryDate.diff(today, 'day') > 0 &&
        licenseExpiryDate.diff(today, 'day') <= 3
      );
    },
    [licenseExpiryDateUuid],
  );

  const isUnlicensed = useCallback(
    (provider) => {
      const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
      const licenseNumber = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
      return !nationalId && !licenseNumber;
    },
    [providerNationalIdUuid, licenseNumberUuid],
  );

  const handleOpenSyncModal = useCallback((provider) => {
    setSyncLoading(true);
    showModal('hwr-syncing-modal', { provider });
    setSyncLoading(false);
  }, []);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter((user) => user.person.display.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    switch (selectedFilter) {
      case 'activeLicensed':
        filtered = filtered.filter((user) => {
          const userProvider = provider.find((p) => p.person?.uuid === user.person.uuid);
          return userProvider && isActiveLicensed(userProvider);
        });
        break;
      case 'expiredLicensed':
        filtered = filtered.filter((user) => {
          const userProvider = provider.find((p) => p.person?.uuid === user.person.uuid);
          return userProvider && isExpiredLicensed(userProvider);
        });
        break;
      case 'licensedExpiringSoon':
        filtered = filtered.filter((user) => {
          const userProvider = provider.find((p) => p.person?.uuid === user.person.uuid);
          return userProvider && isExpiringSoon(userProvider);
        });
        break;
      case 'unlicensed':
        filtered = filtered.filter((user) => {
          const userProvider = provider.find((p) => p.person?.uuid === user.person.uuid);
          return userProvider && isUnlicensed(userProvider);
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [users, searchQuery, selectedFilter, provider, isActiveLicensed, isExpiredLicensed, isExpiringSoon, isUnlicensed]);

  const { paginated, goTo, results, currentPage } = usePagination(filteredUsers, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, filteredUsers.length, currentPage, results?.length);

  if (isLoadingUsers || isLoading) {
    return (
      <div className={styles.Container}>
        <DataTableSkeleton />
      </div>
    );
  }

  if (error || usersError || providerError) {
    return <ErrorState error={error || usersError} headerTitle={t('usersManagement', 'Users management')} />;
  }

  if (users.length === 0) {
    return <EmptyState subTitle={t('noUsersAvailable', 'No users available')} />;
  }

  const headerData = [
    {
      key: 'systemId',
      header: t('systemId', 'System ID'),
    },
    {
      key: 'names',
      header: t('names', 'Names'),
    },
    {
      key: 'licenseNumber',
      header: t('licenseNumber', 'License Number'),
    },
    {
      key: 'licenseExpiryDate',
      header: t('licenseExpiryDate', 'License Expiry Date'),
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const rowData = results?.map((user) => {
    const userHasInventoryRole = user.roles.some((role) => inventoryRoleNames.includes(role.display));
    const userProvider = provider.find((p) => p.person?.uuid === user.person.uuid);

    const licenseNumberAttribute = userProvider?.attributes.find(
      (attr) => attr?.attributeType?.uuid === licenseNumberUuid,
    );
    const licenseExpiryDateAttribute = userProvider?.attributes.find(
      (attr) => attr?.attributeType?.uuid === licenseExpiryDateUuid,
    );
    const licenseNumber = licenseNumberAttribute ? licenseNumberAttribute.value : '--';
    const licenseExpiryDate = licenseExpiryDateAttribute ? licenseExpiryDateAttribute.value : '--';

    const providerNationalId = userProvider?.attributes.find(
      (attr) => attr?.attributeType?.uuid === providerNationalIdUuid,
    );
    const registrationNumber = userProvider?.attributes.find((attr) => attr?.attributeType?.uuid === licenseBodyUuid);
    const passPortNumber = userProvider?.attributes.find((attr) => attr?.attributeType?.uuid === passportNumberUuid);

    const isSyncEnabled = !!(providerNationalId?.value || registrationNumber?.value || passPortNumber?.value);

    return {
      id: user.uuid,
      systemId: user.systemId,
      names: capitalize(user.person.display),
      licenseNumber: licenseNumber,
      licenseExpiryDate: formatDateTime(new Date(licenseExpiryDate)),
      userProvider,
      user,
      actions: (
        <OverflowMenu className={styles.btnSet} flipped={true} aria-label="user-management-menu">
          <OverflowMenuItem
            className={styles.btn}
            onClick={() => {
              const selectedUser = users.find((u) => u.uuid === user.uuid);
              if (selectedUser) {
                launchWorkspace('manage-user-workspace', {
                  workspaceTitle: t('editUser', 'Edit User'),
                  initialUserValue: user,
                });
              } else {
                console.error('User not found:', user.uuid);
              }
            }}
            itemText={t('editUser', 'Edit user')}
          />
          <OverflowMenuItem
            itemText={t('sync', 'Sync')}
            onClick={() => handleOpenSyncModal(userProvider)}
            disabled={!isSyncEnabled || syncLoading}
          />
          <OverflowMenuItem
            hasDivider
            disabled={!userHasInventoryRole}
            onClick={() => {
              launchWorkspace('user-role-scope-workspace', {
                workspaceTitle: t('manageUserRoleScope', 'Manage user role scope'),
                user: user,
              });
            }}
            itemText={t('manageUserRoleScope', 'Manage user role scope')}
          />
        </OverflowMenu>
      ),
    };
  });

  return (
    <>
      <div>
        <div className={styles.Container}>
          <div className={styles.buttonContainer}>
            <p className={styles.filterByText}>{t('filterBy', 'Filter by:')}</p>
            <Dropdown
              id="filter-dropdown"
              label={t('filter', 'Filter')}
              className={styles.dropDownFilter}
              items={[
                { id: 'allUsers', label: t('All users', 'All users') },
                { id: 'activeLicensed', label: t('Active Licensed', 'Active Licensed') },
                { id: 'expiredLicensed', label: t('Expired Licensed', 'Expired Licensed') },
                { id: 'licensedExpiringSoon', label: t('Licensed expiring soon', 'Licensed expiring soon') },
                { id: 'unlicensed', label: t('Unlicensed', 'Unlicensed') },
              ]}
              itemToString={(item) => (item ? item.label : '')}
              onChange={({ selectedItem }) => setSelectedFilter(selectedItem.id)}
              selectedItem={{ id: selectedFilter, label: t(selectedFilter, selectedFilter) }}
              size={isDesktop(layout) ? 'lg' : 'sm'}
            />
            <Button
              onClick={() => launchWorkspace('manage-user-workspace', { workspaceTitle: t('addUser', 'Add user') })}
              className={styles.userManagementModeButton}
              renderIcon={UserFollow}
              size={isDesktop(layout) ? 'lg' : 'sm'}
              kind="primary">
              {t('addUser', 'Add User')}
            </Button>
          </div>

          <div className={styles.providerContainer}>
            <CardHeader
              title={`${t(getCardTitle(selectedFilter), { count: filteredUsers.length })} (${filteredUsers.length})`}>
              {''}
            </CardHeader>
            <Search
              labelText=""
              placeholder={t('searchForUsers', 'Search for user')}
              onChange={(e) => setSearchQuery(e.target.value)}
              size={isDesktop(layout) ? 'sm' : 'lg'}
              value={searchQuery}
            />

            {filteredUsers.length === 0 ? (
              <EmptyState subTitle={t('noMatchingUsers', 'No matching users found')} />
            ) : (
              <>
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
                                    <UserDetails provider={rowData[i].userProvider} user={rowData[i].user} />
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
                    totalItems={filteredUsers.length}
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
              </>
            )}
          </div>
        </div>
      </div>
      <WorkspaceContainer overlay contextKey="admin" />
    </>
  );
};

export default UserList;
