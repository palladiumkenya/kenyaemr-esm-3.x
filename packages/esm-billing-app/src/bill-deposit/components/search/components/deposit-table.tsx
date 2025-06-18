import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
} from '@carbon/react';
import { launchWorkspace, showModal, usePagination } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { type FormattedDeposit } from '../../../types/bill-deposit.types';
import { BILL_DEPOSIT_STATUS } from '../../../constants/bill-deposit.constants';
import TransactionList from './transaction-list/transaction-list.component';

interface DepositTableProps {
  deposits: Array<FormattedDeposit>;
}

const DepositTable: React.FC<DepositTableProps> = ({ deposits }) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const { results, totalPages, currentPage, goTo } = usePagination(deposits, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);

  const headers = [
    { header: t('dateCreated', 'Date Created'), key: 'dateCreated' },
    { header: t('referenceNumber', 'Reference Number'), key: 'referenceNumber' },
    { header: t('depositType', 'Deposit Type'), key: 'depositType' },
    { header: t('amount', 'Amount'), key: 'amount' },
    { header: t('availableBalance', 'Available Balance'), key: 'availableBalance' },
    { header: t('status', 'Status'), key: 'status' },
  ];

  const handleEditDeposit = (deposit: FormattedDeposit) => {
    launchWorkspace('add-deposit-workspace', {
      deposit: { ...deposit, uuid: deposit.id },
      patientUuid: deposit?.patient?.uuid,
    });
  };

  const handleDeleteDeposit = (deposit: FormattedDeposit) => {
    const dispose = showModal('delete-deposit-modal', {
      depositUuid: deposit.id,
      onClose: () => dispose(),
      isOpen: true,
    });
  };

  const handleApplyDepositToBill = (deposit: FormattedDeposit) => {
    launchWorkspace('deposit-transaction-workspace', {
      deposit: { ...deposit, uuid: deposit.id },
      patientUuid: deposit?.patient?.uuid,
    });
  };

  return (
    <>
      <DataTable size="sm" useZebraStyles rows={results} headers={headers}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getTableContainerProps,
          getExpandHeaderProps,
        }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                <TableExpandHeader {...getExpandHeaderProps()} />
                {headers.map((header) => (
                  <TableHeader key={header.key} {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
                <TableHeader aria-label={t('overflowMenu', 'Overflow menu')} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <TableExpandRow {...getRowProps({ row })} isExpanded={row.isExpanded}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                    <TableCell className="cds--table-column-menu">
                      <OverflowMenu size="sm" flipped>
                        {deposits[index].status !== BILL_DEPOSIT_STATUS.USED && (
                          <>
                            <OverflowMenuItem
                              itemText={t('applyDepositToBill', 'Apply Deposit to Bill')}
                              onClick={() => handleApplyDepositToBill(deposits[index])}
                            />
                            <OverflowMenuItem
                              itemText={t('editDeposit', 'Edit Deposit')}
                              onClick={() => handleEditDeposit(deposits[index])}
                            />
                            <OverflowMenuItem
                              hasDivider
                              isDelete
                              itemText={t('deleteDeposit', 'Delete Deposit')}
                              onClick={() => handleDeleteDeposit(deposits[index])}
                            />
                          </>
                        )}
                      </OverflowMenu>
                    </TableCell>
                  </TableExpandRow>
                  {row.isExpanded && (
                    <TableExpandedRow colSpan={headers.length + 2}>
                      <TransactionList transactions={deposits[index].transactions} depositUuid={deposits[index].id} />
                    </TableExpandedRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>

      <Pagination
        backwardText="Previous page"
        forwardText="Next page"
        itemsPerPageText="Items per page:"
        page={currentPage}
        pageNumberText="Page Number"
        pageSize={pageSize}
        pageSizes={pageSizes}
        size="md"
        totalItems={deposits.length}
        onChange={({ page, pageSize: newPageSize }) => {
          goTo(page);
          setPageSize(newPageSize);
        }}
      />
    </>
  );
};

export default DepositTable;
