import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
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
  Button,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { AddAlt, ArrowDownLeft, ArrowLeft } from '@carbon/react/icons';
import styles from '../../manage-user.scss';
import {
  isDesktop,
  launchWorkspace,
  restBaseUrl,
  showModal,
  showSnackbar,
  WorkspaceContainer,
} from '@openmrs/esm-framework';
import { deleteUserRoleScopes, handleMutation, useUserRoleScopes } from '../../../../../user-management.resources';
import { User, UserRoleScope } from '../../../../../types';

interface StockUserRoleScopesListProps {
  user?: User;
  onEditUserRoleScope?: (userRoleScope: UserRoleScope) => void;
  onAddUserRoleScope?: (isAddRoleScope: boolean) => void;
}

const StockUserRoleScopesList: React.FC<StockUserRoleScopesListProps> = ({
  user,
  onEditUserRoleScope,
  onAddUserRoleScope,
}) => {
  const { t } = useTranslation();

  // Fetch user role scopes
  const { items: userRoleScopes, loadingRoleScope } = useUserRoleScopes();
  const [deletingUserScope, setDeletingUserScope] = useState(false);
  const size = 'mid';

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

  const showDeleteUserRoleScopeModal = useCallback(
    (uuid: string) => {
      const close = showModal('delete-stock-user-scope-modal', {
        close: () => close(),
        uuid,
        onConfirmation: () => {
          deleteUserRoleScopes([uuid])
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
    },
    [t],
  );

  const renderLocationIcon = (enableDescendants) => (enableDescendants ? <ArrowDownLeft /> : <ArrowLeft />);

  const tableRows = useMemo(() => {
    return (
      (userRoleScopes?.results ?? [])
        .filter((scope) => scope.userUuid === user.uuid)
        .map((userRoleScope, index) => ({
          id: index.toString(),
          role: userRoleScope.role || 'N/A',
          location: userRoleScope?.locations?.map((location) => (
            <span key={`loc-${userRoleScope?.uuid}-${location.locationUuid}`}>
              {location?.locationName} {renderLocationIcon(location?.enableDescendants)}
            </span>
          )),
          stockOperation: userRoleScope?.operationTypes?.map((operation) => operation?.operationTypeName).join(', '),
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
  }, [userRoleScopes, t, user.uuid, showDeleteUserRoleScopeModal, onEditUserRoleScope]);

  if (loadingRoleScope) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <div>
      <CardHeader title="Manage User Role Scope" children={''}></CardHeader>
      <div className={styles.dataTable}>
        <DataTable useZebraStyle size={size} rows={tableRows} headers={tableHeaders}>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()} aria-label="user role scope table">
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
                      <TableRow key={row.id} {...getRowProps({ row })}>
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
            </TableContainer>
          )}
        </DataTable>
      </div>
    </div>
  );
};

export default StockUserRoleScopesList;
