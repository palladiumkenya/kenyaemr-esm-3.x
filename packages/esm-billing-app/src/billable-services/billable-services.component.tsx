import React from 'react';
import styles from './billable-services.scss';
import { useTranslation } from 'react-i18next';

type BillableServicesProps = {};

const BillableServices: React.FC<BillableServicesProps> = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.billableServiceContainer}>
      <h2>Billable Services</h2>
    </div>
  );
};

export default BillableServices;
