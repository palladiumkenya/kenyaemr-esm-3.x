import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../metrics/metrics.scss';
import { ClaimsManagementHeader } from '../header/claims-header.component';
import ClaimsSummaryHeader from '../header/summary-header.component';
import { ClaimsSummaryFilter } from '../../../types';
import ClaimsSummaryChart from './claims-summary-chart.component';

import MetricsCard from '../../metrics/metrics-card.component';
import { convertToCurrency } from '../../../helpers';
import useClaimsAggregate from '../../../hooks/useClaimsAggregate';

const MainMetrics = () => {
  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
  });
  const onFilterChanged = (updateFn: (currentFilters: any) => any) => {
    setFilters(updateFn(filters));
  };

  const t = (key, fallback) => fallback;

  const { isLoading, summarizedData, error } = useClaimsAggregate();

  if (error) {
    return <div>Error loading claims data</div>;
  }

  if (isLoading) {
    return <div>Loading claims data...</div>;
  }

  const totalClaimed = summarizedData.reduce((sum, item) => sum + item.claimedTotal, 0);
  const totalApproved = summarizedData.reduce((sum, item) => sum + item.approvedTotal, 0);
  const totalPending = totalClaimed - totalApproved;

  const preApps = 0;
  const preAppsApproved = 0;
  const preAppsPending = 0;

  return (
    <div className={`omrs-main-content`}>
      <ClaimsManagementHeader title={t('claims', 'Claims Summary')} />
      <ClaimsSummaryHeader filters={filters} onFilterChanged={onFilterChanged} />
      <>
        <div className={styles.cardContainer} data-testid="claims-metrics">
          <MetricsCard
            label={t('ksh', '')}
            value={convertToCurrency(totalClaimed)}
            headerLabel={t('claimsItems', 'Total Claimed')}
          />
          <MetricsCard
            label={t('ksh', '')}
            value={convertToCurrency(totalApproved)}
            headerLabel={t('claimsItems', 'Total Approved')}
          />
          <MetricsCard
            label={t('ksh', '')}
            value={convertToCurrency(totalPending)}
            headerLabel={t('claimsItems', 'Amount Pending')}
          />
        </div>
        <div className={styles.cardContainer} data-testid="claims-metrics">
          <MetricsCard label={t('ksh', '')} value={preApps} headerLabel={t('claimsItems', 'Total Preauth')} />
          <MetricsCard
            label={t('ksh', '')}
            value={preAppsApproved}
            headerLabel={t('claimsItems', 'Approved Preauth')}
          />
          <MetricsCard label={t('ksh', '')} value={preAppsPending} headerLabel={t('claimsItems', 'Pending Preauth')} />
        </div>
        <ClaimsSummaryChart />
      </>
    </div>
  );
};

export default MainMetrics;
