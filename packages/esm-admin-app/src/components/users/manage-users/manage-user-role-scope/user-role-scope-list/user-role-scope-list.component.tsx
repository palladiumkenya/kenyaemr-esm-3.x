import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import {
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { ArrowDownLeft, ArrowLeft } from '@carbon/react/icons';
import styles from '../../manage-user.scss';
import { isDesktop, restBaseUrl, showModal, showSnackbar } from '@openmrs/esm-framework';
import { deleteUserRoleScopes, handleMutation, useUserRoleScopes } from '../../../../../user-management.resources';
import { UserRoleScope } from '../../../../../config-schema';

interface StockUserRoleScopesListProps {
  userUuid?: string;
  onEditUserRoleScope?: (userRoleScope: UserRoleScope) => void;
}

const StockUserRoleScopesList: React.FC<StockUserRoleScopesListProps> = ({ userUuid, onEditUserRoleScope }) => {
  const { t } = useTranslation();

  // Fetch user role scopes
  const { items: userRoleScopes, loadingRoleScope } = useUserRoleScopes();
  const [deletingUserScope, setDeletingUserScope] = useState(false);

  const tableHeaders = useMemo(
    () => [
      { key: 'role', header: t('role', 'Role') },
      { key: 'location', header: t('location', 'Location(s)') },
      { key: 'stockOperation', header: t('stockOperation', 'Stock Operation') },
      { key: 'permanent', header: t('permanent', 'Permanent') },
      { key: 'enabled', header: t('enabled', 'Enabled') },
      { key: 'actions', header: t('actions', 'Actions') },
    ],
    [t],
  );

  const showDeleteUserRoleScopeModal = (uuid: string) => {
    const close = showModal('delete-stock-user-scope-modal', {
      close: () => close(),
      uuid: uuid,
      onConfirmation: () => {
        const ids = [];
        ids.push(uuid);
        deleteUserRoleScopes(ids)
          .then(
            () => {
              handleMutation(`${restBaseUrl}/stockmanagement/userrolescope`);
              setDeletingUserScope(false);
              showSnackbar({
                isLowContrast: true,
                title: t('deletingstockUserScope', 'Delete Stock User Scope'),
                kind: 'success',
                subtitle: t('stockUserScopeDeletedSuccessfully', 'Stock User Scope Deleted Successfully'),
              });
            },
            (error) => {
              setDeletingUserScope(false);
              showSnackbar({
                title: t('errorDeletingUserScope', 'Error deleting a user scope'),
                kind: 'error',
                isLowContrast: true,
                subtitle: error?.message,
              });
            },
          )
          .catch();
        close();
      },
    });
  };

  const tableRows = useMemo(() => {
    return (
      userRoleScopes?.results
        ?.filter((scope) => scope.userUuid === userUuid)
        .map((userRoleScope, index) => ({
          id: index.toString(),
          role: userRoleScope.role || 'N/A',
          location: userRoleScope?.locations?.map((location) => {
            const key = `loc-${userRoleScope?.uuid}-${location.locationUuid}`;
            return (
              <span key={key}>
                {location?.locationName}
                {location?.enableDescendants ? (
                  <ArrowDownLeft key={`${key}-${index}-0`} />
                ) : (
                  <ArrowLeft key={`${key}-${index}-1`} />
                )}{' '}
              </span>
            );
          }),
          stockOperation: userRoleScope?.operationTypes
            ?.map((operation) => {
              return operation?.operationTypeName;
            })
            ?.join(', '),
          permanent: userRoleScope.permanent ? t('yes', 'Yes') : t('no', 'No'),
          enabled: userRoleScope.enabled ? t('yes', 'Yes') : t('no', 'No'),
          actions: (
            <OverflowMenu className={styles.btnSet}>
              <OverflowMenuItem
                onClick={() => {
                  onEditUserRoleScope(userRoleScope);
                }}
                itemText={t('edit', 'Edit')}
              />
              <OverflowMenuItem
                hasDivider
                isDelete
                onClick={() => {
                  showDeleteUserRoleScopeModal(userRoleScope.uuid);
                }}
                itemText={t('delete', 'Delete')}
              />
            </OverflowMenu>
          ),
        })) || []
    );
  }, [userRoleScopes, t, userUuid, onEditUserRoleScope]);

  return (
    <TableContainer title={t('userRoleScopes', 'User Role Scopes')}>
      <TableToolbar>
        <TableToolbarContent>
          <TableToolbarSearch onChange={(e) => {}} />
        </TableToolbarContent>
      </TableToolbar>

      {loadingRoleScope ? (
        <DataTableSkeleton rowCount={5} headers={tableHeaders} />
      ) : (
        <DataTable rows={tableRows} headers={tableHeaders}>
          {({ rows, headers, getHeaderProps }) => (
            <Table>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={headers.length} className={styles.emptyTable}>
                      <EmptyState
                        displayText={t('noUserRoleScope', 'No user role scope')}
                        headerTitle={t('userRoleScope', 'User Role Scope')}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DataTable>
      )}

      <Pagination
        totalItems={tableRows.length}
        pageSize={5}
        pageSizes={[5, 10, 20]}
        onChange={({ page, pageSize }) => {}}
      />
    </TableContainer>
  );
};

export default StockUserRoleScopesList;
