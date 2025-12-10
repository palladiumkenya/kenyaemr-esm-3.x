import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContainedList, ContainedListItem, OverflowMenu, OverflowMenuItem, InlineNotification } from '@carbon/react';
import { BillDepositTransaction } from '../../../../types/bill-deposit.types';
import { formatDate, parseDate, showModal } from '@openmrs/esm-framework';
import styles from './transaction-list.scss';
import { useCurrencyFormatting } from '../../../../../../helpers/currency';

type TransactionListProps = {
  transactions: Array<BillDepositTransaction>;
  depositUuid: string;
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, depositUuid }) => {
  const { t } = useTranslation();
  const { format: formatCurrency } = useCurrencyFormatting();

  const handleReverse = (transaction: BillDepositTransaction) => {
    const dispose = showModal('reverse-transaction-modal', {
      depositUuid: depositUuid,
      transaction,
      onClose: () => dispose(),
    });
  };

  const filterTransactions = (transactions: Array<BillDepositTransaction>) => {
    return transactions.filter((transaction) => transaction.voided === false);
  };

  if (filterTransactions(transactions).length === 0) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast
        statusIconDescription="notification"
        subtitle={t('noTransactions', 'No transactions found')}
        title={t('noTransactions', 'No transactions found')}
      />
    );
  }

  return (
    <ContainedList
      className={styles.transactionListContainer}
      size="sm"
      label={t('transactionList', 'Transaction List')}>
      {filterTransactions(transactions).map((transaction) => (
        <ContainedListItem
          key={transaction.uuid}
          action={
            <OverflowMenu flipped size="sm" ariaLabel={t('transactionListOptions', 'Transaction list options')}>
              <OverflowMenuItem onClick={() => handleReverse(transaction)} itemText={t('reverse', 'Reverse')} />
              <OverflowMenuItem itemText={t('remove', 'Remove')} isDelete hasDivider />
            </OverflowMenu>
          }>
          {`${formatDate(parseDate(transaction.dateCreated))} - ${transaction.transactionType} - ${formatCurrency(
            transaction.amount,
          )}${transaction.reason ? ' - ' + transaction.reason : ''}`}
        </ContainedListItem>
      ))}
    </ContainedList>
  );
};

export default TransactionList;
