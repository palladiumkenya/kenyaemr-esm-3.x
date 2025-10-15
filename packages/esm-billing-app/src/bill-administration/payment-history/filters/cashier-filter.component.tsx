import React from 'react';
import { MultiSelect } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { usePaymentFilterContext } from '../usePaymentFilterContext';
import { usePaymentTransactionHistory } from '../usePaymentTransactionHistory';

interface MultiSelectItem {
  id: string;
  text: string;
  isSelectAll?: boolean;
}

export const CashierFilter: React.FC = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = usePaymentFilterContext();
  const { bills, isLoading } = usePaymentTransactionHistory(filters);
  const uniqueCashiers = Array.from(
    new Map(bills.map((transaction) => [transaction.cashier.uuid, transaction.cashier])).values(),
  );

  const cashierSelectOptions: MultiSelectItem[] = [
    {
      id: 'select-all',
      text: t('allCashiers', 'All Cashiers'),
      isSelectAll: true,
    },
    ...uniqueCashiers.map((cashier) => ({
      id: cashier.uuid,
      text: cashier.display,
    })),
  ];

  const handleCashierSelection = (selectedItems: MultiSelectItem[]) => {
    const selectedNames = selectedItems.map((item) => item.id);
    setFilters({ ...filters, cashiers: selectedNames });
  };

  const initialSelectedItems = filters?.cashiers?.map((cashierName) => ({
    id: uniqueCashiers.find((cashier) => cashier.display === cashierName)?.uuid ?? cashierName,
    text: cashierName,
  }));

  if (uniqueCashiers.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '15rem' }}>
      <MultiSelect
        id="cashier-filter"
        label={t('cashier', 'Cashier')}
        titleText={t('cashier', 'Cashier')}
        items={cashierSelectOptions}
        initialSelectedItems={initialSelectedItems}
        itemToString={(item) => (item ? item.text : '')}
        selectionFeedback="top-after-reopen"
        onChange={(event) => handleCashierSelection(event.selectedItems)}
      />
    </div>
  );
};
