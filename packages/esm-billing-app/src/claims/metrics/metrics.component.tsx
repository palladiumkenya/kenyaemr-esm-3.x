import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './metrics.scss';
import MetricsHeader from './metrics-header.component';
import MetricsCard from './metrics-card.component';
import { computeTotalPrice } from '../../utils';
import { LineItem, MappedBill } from '../../types';
import { convertToCurrency, formatDate } from '../../helpers';

interface MainMetricsProps {
  selectedLineItems: LineItem[];
  bill: MappedBill;
}

const MainMetrics: React.FC<MainMetricsProps> = ({ selectedLineItems, bill }) => {
  const { t } = useTranslation();

  const numberOfLineItems = selectedLineItems.length;

  const hasMoreThanOneLineItem = bill?.lineItems?.length > 1;
  const computedTotal = hasMoreThanOneLineItem ? computeTotalPrice(selectedLineItems) : bill.totalAmount ?? 0;

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer} data-testid="claims-metrics">
        <MetricsCard
          label={t('total', 'Amount')}
          value={convertToCurrency(computedTotal)}
          headerLabel={t('totalAmount', 'Total Amount')}
        />
        <MetricsCard
          label={t('items', 'Items')}
          value={numberOfLineItems.toString()}
          headerLabel={t('claimsItems', 'Claims Items')}
        />
        <MetricsCard
          label={t('date', 'Date of Claim')}
          value={formatDate(bill.dateCreated)}
          headerLabel={t('date', 'Date of Claim')}
        />
      </div>
    </>
  );
};

export default MainMetrics;
