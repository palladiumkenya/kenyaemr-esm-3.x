import React from 'react';
import { CashierFilter } from './cashier-filter.component';
import { PaymentTypeFilter } from './payment-type-filter.component';
import { ServiceTypeFilter } from './service-type-filter.component';
import styles from './filter.scss';

export const Filter = () => {
  return (
    <div className={styles.filterContainer}>
      <ServiceTypeFilter />
      <PaymentTypeFilter />
      <CashierFilter />
    </div>
  );
};
