import React, { useMemo, useState } from 'react';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Search,
  DataTableSkeleton,
  Button,
  Pagination,
  ButtonSet,
} from '@carbon/react';
import { Edit, UserFollow } from '@carbon/react/icons';
import styles from './user-list.scss';
import { launchWorkspace, useDebounce, WorkspaceContainer } from '@openmrs/esm-framework';
import { useUser } from '../../../../user-management.resources';

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const size = 'md';
  const { users = [], isLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filteredUserList = useMemo(() => {
    return (
      users.filter((user) => {
        const rolesDisplay = user.roles
          .map((role) => role.display)
          .join(', ')
          .toLowerCase();
        const fullName = user.person.display.toLowerCase();
        return (
          user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          user.systemId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          fullName.includes(debouncedSearchTerm.toLowerCase()) ||
          rolesDisplay.includes(debouncedSearchTerm.toLowerCase())
        );
      }) ?? []
    );
  }, [users, debouncedSearchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUserList.slice(startIndex, endIndex);
  }, [filteredUserList, currentPage, pageSize]);

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        displayText={t('noUsers', 'No User Available')}
        headerTitle={t('userManagement', 'User Management')}
        launchForm={() => launchWorkspace('manage-user-workspace', { workspaceTitle: t('addUser', 'Add User') })}
      />
    );
  }

  const headers = [
    {
      key: 'systemId',
      header: t('systemId', 'System ID'),
    },
    {
      key: 'username',
      header: t('username', 'Username'),
    },
    {
      key: 'given',
      header: t('given', 'Given Name'),
    },
    {
      key: 'familyName',
      header: t('familyName', 'Family Name'),
    },
    {
      key: 'roles',
      header: t('roles', 'Roles'),
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const rows = paginatedUsers.map((user, index) => {
    const rolesDisplay =
      user.roles.length > 2
        ? `${user.roles[0].display}, ${user.roles[1].display}, ...`
        : user.roles.map((role) => role.display).join(', ');

    const [given, ...familyNameParts] = user.person.display.split(' ');
    const familyName = familyNameParts.join(' ');

    return {
      id: user.uuid,
      systemId: `${user.systemId}`,
      username: user.username,
      given: given,
      familyName: familyName,
      roles: rolesDisplay,
      actions: (
        <ButtonSet className={styles.btnSet}>
          <Button
            className={styles.btn}
            renderIcon={Edit}
            hasIconOnly
            kind="ghost"
            iconDescription={t('edit', 'Edit')}
            onClick={() => {
              const selectedUser = users.find((u) => u.uuid === user.uuid);
              if (selectedUser) {
                launchWorkspace('manage-user-workspace', {
                  workspaceTitle: t('editUser', 'Edit User'),
                  initialUserValue: selectedUser,
                });
              } else {
                console.error('User not found:', user.uuid);
              }
            }}
          />
        </ButtonSet>
      ),
    };
  });

  return (
    <>
      <div>
        <CardHeader title="Current Users">
          <Button
            onClick={() => launchWorkspace('manage-user-workspace', { workspaceTitle: t('addUser', 'Add User') })}
            className={styles.userManagementModeButton}
            renderIcon={UserFollow}
            size={size}
            kind="primary">
            {t('addUser', 'Add User')}
          </Button>
        </CardHeader>
        <div className={styles.dataTable}>
          <Search
            size={size}
            placeholder={t('searchUser', 'Search user table')}
            labelText={t('searchLabel', 'Search')}
            closeButtonLabelText={t('clearSearch', 'Clear search input')}
            id="search-1"
            onChange={(event) => handleSearch(event.target.value)}
          />
          <DataTable useZebraStyles size={size} rows={rows} headers={headers}>
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
              <TableContainer>
                <Table {...getTableProps()} aria-label="user table">
                  <TableHead>
                    <TableRow>
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
                    {rows.map((row) => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
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
          <Pagination
            totalItems={filteredUserList.length}
            pageSize={pageSize}
            pageSizes={[5, 10, 20]}
            onChange={({ page, pageSize }) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            }}
          />
        </div>
      </div>
      <WorkspaceContainer overlay contextKey="admin" />
    </>
  );
};

export default UserList;
