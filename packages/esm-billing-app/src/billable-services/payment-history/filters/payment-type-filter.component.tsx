import { MultiSelect, SkeletonIcon } from '@carbon/react';
import React from 'react';
import { usePaymentModes } from '../../../billing.resource';
import styles from '../payment-history.scss';
import { useTranslation } from 'react-i18next';
import { usePaymentFilterContext } from '../usePaymentFilterContext';

interface PaymentTypeFilterProps {}

export const PaymentTypeFilter: React.FC<PaymentTypeFilterProps> = () => {
  const { t } = useTranslation();
  const { isLoading, paymentModes } = usePaymentModes(false);
  const { filters, setFilters } = usePaymentFilterContext();
  const handleSelectionChange = (selectedItems: Array<{ id: string; text: string }>) => {
    // Handle "Select All" case
    if (selectedItems.some((item) => item.id === 'select-all')) {
      const allPaymentTypes = paymentModes.map((mode) => mode.name);
      setFilters({ ...filters, paymentMethods: allPaymentTypes });
      return;
    }

    // Handle normal selection
    const selectedPaymentTypes = selectedItems.map((item) => item.text);
    setFilters({ ...filters, paymentMethods: selectedPaymentTypes });
  };

  if (isLoading) {
    return <SkeletonIcon className={styles.skeletonIcon} />;
  }

  const multiSelectItems = [
    {
      id: 'select-all',
      text: t('allPaymentModes', 'All Payment Modes'),
      isSelectAll: true,
    },
    ...paymentModes.map((method) => ({
      id: method.uuid,
      text: method.name,
      isSelectAll: false,
    })),
  ];

  return (
    <div style={{ width: '15rem' }}>
      <MultiSelect
        label={t('paymentType', 'Payment Type')}
        id="payment-type-filter"
        titleText={t('paymentType', 'Payment Type')}
        items={multiSelectItems}
        initialSelectedItems={filters.paymentMethods.map((type) => ({
          id: paymentModes.find((mode) => mode.name === type)?.uuid ?? type,
          text: type,
        }))}
        itemToString={(item) => (item ? item.text : '')}
        selectionFeedback="top-after-reopen"
        onChange={(event) => handleSelectionChange(event.selectedItems)}
      />
    </div>
  );
};
