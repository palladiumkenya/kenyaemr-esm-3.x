import React from 'react';
import styles from './invoice-breakdown.scss';

type InvoiceBreakDownProps = {
  label: string;
  value: string;
};

export const InvoiceBreakDown: React.FC<InvoiceBreakDownProps> = ({ label, value }) => {
  return (
    <div className={styles.invoiceBreakdown}>
      <span className={styles.label}>{label}: </span>
      <span className={styles.value}>{value}</span>
    </div>
  );
};
