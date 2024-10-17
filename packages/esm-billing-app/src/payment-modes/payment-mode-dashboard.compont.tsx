import React, { useMemo, useState } from 'react';
import { usePaymentModes } from '../billing.resource';
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
  OverflowMenuItem,
  TableCell,
  OverflowMenu,
  Search,
  DataTableSkeleton,
  Button,
} from '@carbon/react';

import styles from './payment-mode-dashboard.scss';
import { formatDate, launchWorkspace, showModal, useDebounce } from '@openmrs/esm-framework';
import { PaymentMode } from '../types';

type PaymentModeDashboardProps = {};

const PaymentModeDashboard: React.FC<PaymentModeDashboardProps> = () => {
  const { t } = useTranslation();
  const { paymentModes, isLoading } = usePaymentModes();
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filteredPaymentModes = useMemo(() => {
    return (
      paymentModes.filter((paymentMode) =>
        paymentMode.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      ) ?? []
    );
  }, [paymentModes, debouncedSearchTerm]);

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const showDeletePaymentModeModal = (paymentMode: PaymentMode) => {
    const dispose = showModal('delete-payment-mode-modal', {
      closeModal: () => dispose(),
      paymentMode,
    });
  };

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (paymentModes.length === 0) {
    return (
      <EmptyState
        displayText={t('noPaymentModes', 'No payment modes')}
        headerTitle={t('paymentModes', 'Payment Modes')}
        launchForm={() =>
          launchWorkspace('payment-mode-workspace', { workspaceTitle: t('addPaymentMode', 'Add Payment Mode') })
        }
      />
    );
  }

  const headers = [
    {
      key: 'dateCreated',
      header: t('dateCreated', 'Date Created'),
    },
    {
      key: 'name',
      header: t('name', 'Name'),
    },
    {
      key: 'description',
      header: t('description', 'Description'),
    },
  ];

  const rows = filteredPaymentModes.map((paymentMode) => ({
    id: `${paymentMode.uuid}`,
    name: paymentMode.name,
    description: paymentMode.description,
    dateCreated: formatDate(new Date(paymentMode.auditInfo.dateCreated), {
      mode: 'standard',
      time: false,
      noToday: true,
    }),
  }));

  return (
    <div>
      <CardHeader title="Payment Modes">
        <Button
          onClick={() =>
            launchWorkspace('payment-mode-workspace', { workspaceTitle: t('addPaymentMode', 'Add Payment Mode') })
          }
          className={styles.addPaymentModeButton}
          size="md"
          kind="ghost">
          {t('addPaymentMode', 'Add Payment Mode')}
        </Button>
      </CardHeader>
      <div className={styles.dataTable}>
        <Search
          size="md"
          placeholder={t('searchPaymentMode', 'Search payment mode table')}
          labelText={t('searchLabel', 'Search')}
          closeButtonLabelText={t('clearSearch', 'Clear search input')}
          id="search-1"
          onChange={(event) => handleSearch(event.target.value)}
        />
        <DataTable useZebraStyles size="md" rows={rows} headers={headers}>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()} aria-label="sample table">
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
                    <TableHeader aria-label="overflow actions" />
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
                        <OverflowMenu size="sm" flipped>
                          <OverflowMenuItem
                            onClick={() =>
                              launchWorkspace('payment-mode-workspace', {
                                workspaceTitle: t('editPaymentMode', 'Edit Payment Mode'),
                                initialPaymentMode: paymentModes[index],
                              })
                            }
                            itemText={t('edit', 'Edit')}
                          />
                          <OverflowMenuItem
                            hasDivider
                            isDelete
                            onClick={() => showDeletePaymentModeModal(paymentModes[index])}
                            itemText={t('delete', 'Delete')}
                          />
                        </OverflowMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    </div>
  );
};

export default PaymentModeDashboard;
