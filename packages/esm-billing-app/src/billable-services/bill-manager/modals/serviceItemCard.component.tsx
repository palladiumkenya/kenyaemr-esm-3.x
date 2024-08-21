import React from 'react';
import styles from './cancel-bill.scss';

export const DeleteBillableServiceModal: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div>
      {label} : <b className={styles.contentvalue}>{value}</b>
    </div>
  );
};
