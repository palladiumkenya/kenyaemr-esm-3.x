import { MultiSelect, SkeletonIcon } from '@carbon/react';
import React from 'react';
import styles from '../payment-history.scss';
import { useBillsServiceTypes } from '../useBillServiceTypes';
import { useTranslation } from 'react-i18next';
import { usePaymentFilterContext } from '../usePaymentFilterContext';
import { usePaymentTransactionHistory } from '../usePaymentTransactionHistory';

export const ServiceTypeFilter = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = usePaymentFilterContext();
  const { bills: filteredBills } = usePaymentTransactionHistory(filters);
  const { billsServiceTypes, isLoading } = useBillsServiceTypes(filteredBills);

  if (isLoading) {
    return <SkeletonIcon className={styles.skeletonIcon} />;
  }

  const initialSelectedItems = filters.serviceTypes.map((type) => ({
    id: type,
    text: type,
  }));

  const serviceTypeSelectOptions = [
    {
      id: 'select-all',
      text: 'Select All',
      isSelectAll: true,
    },
    ...billsServiceTypes.map((type) => ({
      id: type.uuid,
      text: type.display,
    })),
  ];

  const handleServiceTypeSelection = (selectedItems: Array<{ id: string; text: string }>) => {
    if (selectedItems.some((item) => item.id === 'select-all')) {
      const allServiceTypes = billsServiceTypes.map((type) => type.uuid);
      setFilters({ ...filters, serviceTypes: allServiceTypes });
      return;
    }

    const selectedServiceTypes = selectedItems.map((item) => item.id);
    setFilters({ ...filters, serviceTypes: selectedServiceTypes });
  };

  if (billsServiceTypes.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '15rem' }}>
      <MultiSelect
        id="service-type-filter"
        label={t('serviceType', 'Service Type')}
        titleText={t('serviceType', 'Service Type')}
        items={serviceTypeSelectOptions}
        initialSelectedItems={initialSelectedItems}
        itemToString={(item) => (item ? item.text : '')}
        selectionFeedback="top-after-reopen"
        onChange={(event) => handleServiceTypeSelection(event.selectedItems)}
      />
    </div>
  );
};
