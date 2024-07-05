import React from 'react';
import styles from './claims-breakdown.scss';

type ClaimsBreakDownProps = {
  label: string;
  value: string;
  hasBalance?: Boolean;
};

export const ClaimsBreakDown: React.FC<ClaimsBreakDownProps> = ({ label, value, hasBalance }) => {
  return (
    <div className={styles.claimsBreakdownContainer}>
      <div className={styles.claimsBreakdown}>
        <span className={hasBalance ? styles.extendedLabel : styles.label}>{label}: </span>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
};
