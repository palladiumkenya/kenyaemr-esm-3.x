import React from 'react';
import styles from './printable-footer.scss';
import { useDefaultFacility } from '../../billing.resource';

const PrintableFooter = () => {
  const { data, isLoading } = useDefaultFacility();

  if (isLoading) {
    return <div>'--'</div>;
  }
  return (
    <div className={styles.container}>
      <p className={styles.itemFooter}>{data?.display}</p>
    </div>
  );
};

export default PrintableFooter;
