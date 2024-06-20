import React, { useEffect, useState } from 'react';
import styles from './claims-main.scss';
import { LineItem, MappedBill } from '../../types';
import ClaimsTable from '../dashboard/table/claims-table.component';
import ClaimsForm from '../dashboard/form/claims-form.component';
import { useBill } from '../../billing.resource';
import { computeTotalPrice } from '../../utils';
import { ClaimsBreakDown } from '../dashboard/breakdown/claims-breakdown.component';
import { convertToCurrency } from '../../helpers';
import { useTranslation } from 'react-i18next';

interface ClaimsMainProps {
  bill: MappedBill;
}

const ClaimMainComponent: React.FC<ClaimsMainProps> = ({ bill }) => {
  const { t } = useTranslation();

  const [selectedLineItems, setSelectedLineItems] = useState([]);
  const { isLoading: isLoadingBill, error } = useBill(bill.uuid);
  const handleSelectItem = (lineItems: Array<LineItem>) => {
    const paidLineItems = bill?.lineItems?.filter((item) => item.paymentStatus === 'PAID') ?? [];
    setSelectedLineItems([...lineItems, ...paidLineItems]);
  };
  useEffect(() => {
    const paidLineItems = bill?.lineItems?.filter((item) => item.paymentStatus === 'PAID') ?? [];
    setSelectedLineItems(paidLineItems);
  }, [bill.lineItems]);
  const hasMoreThanOneLineItem = bill?.lineItems?.length > 1;
  const computedTotal = hasMoreThanOneLineItem ? computeTotalPrice(selectedLineItems) : bill.totalAmount ?? 0;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.content}>
        <ClaimsTable bill={bill} isLoadingBill={isLoadingBill} onSelectItem={handleSelectItem} />
        <ClaimsForm bill={bill} />
      </div>
      {/* <ClaimsBreakDown label={t('totalClaimAmount', 'Total Claims Amount')} value={convertToCurrency(computedTotal)} /> */}
    </div>
  );
};

export default ClaimMainComponent;
