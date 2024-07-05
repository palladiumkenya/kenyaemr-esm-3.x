import React, { useEffect, useState } from 'react';
import styles from './claims-main.scss';
import { LineItem, MappedBill } from '../../types';
import ClaimsTable from '../dashboard/table/claims-table.component';
import { useBill } from '../../billing.resource';
import { useTranslation } from 'react-i18next';
import ClaimsForm from '../dashboard/form/claims-form.component';
import MainMetrics from '../metrics/metrics.component';

interface ClaimsMainProps {
  bill: MappedBill;
}

const ClaimMainComponent: React.FC<ClaimsMainProps> = ({ bill }) => {
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);
  const { isLoading: isLoadingBill, error } = useBill(bill.uuid);

  const handleSelectItem = (lineItems: Array<LineItem>) => {
    setSelectedLineItems(lineItems);
  };

  return (
    <>
      <MainMetrics selectedLineItems={selectedLineItems} bill={bill} />
      <div className={styles.mainContainer}>
        <div className={styles.content}>
          <ClaimsTable bill={bill} isLoadingBill={isLoadingBill} onSelectItem={handleSelectItem} />
          <ClaimsForm bill={bill} selectedLineItems={selectedLineItems} />
        </div>
      </div>
    </>
  );
};

export default ClaimMainComponent;
