import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../metrics/metrics.scss';
import { ClaimsManagementHeader } from '../header/claims-header.component';
import  ClaimsSummaryHeader  from '../header/summary-header.component';
import { ClaimsSummaryFilter } from '../../../types';
import ClaimsSummaryChart from './claims-summary-chart.component';


import MetricsHeader from '../../metrics/metrics-header.component';
import MetricsCard from '../../metrics/metrics-card.component';
import { convertToCurrency } from '../../../helpers';


const MainMetrics = () => {


  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
  });
  const onFilterChanged = (updateFn: (currentFilters: any) => any) => {
    setFilters(updateFn(filters));
  };
  

  const fromDate = filters.fromDate || new Date();
  const toDate = filters.toDate || new Date();
   // test data values declaration
  const totalAmount = 1150000;
  const claimedAmount = 120000; 

  const pendingAmount = 56000; 

  const preApps = 300; 
  const preAppsApproved = 188; 

  const preAppsPending = 20; 
  
  const t = (key, fallback) => fallback; 
  
  return (
    <div className={`omrs-main-content`}>
      <ClaimsManagementHeader title={t('claims', 'Claims Summary')} />
      <ClaimsSummaryHeader
        filters={filters}
        onFilterChanged={onFilterChanged}
      />       <> 
       <div className={styles.cardContainer} data-testid="claims-metrics">
        <MetricsCard
          label={t('ksh', '')}
          value={convertToCurrency(totalAmount)}
          headerLabel={t('claimsItems', 'Total Claimed')}
        />
        <MetricsCard
          label={t('ksh', '')}
          value={convertToCurrency(claimedAmount)}
          headerLabel={t('claimsItems', 'Total Approved')}
        />
        <MetricsCard
          label={t('ksh', '')}
          value={convertToCurrency(pendingAmount)}
          headerLabel={t('claimsItems', 'Amount Pending')}
        />
      </div>
      <div className={styles.cardContainer} data-testid="claims-metrics">
        <MetricsCard
          label={t('ksh', '')}
          value={preApps}
          headerLabel={t('claimsItems', 'Total Preauth')}
        />
        <MetricsCard
          label={t('ksh', '')}
          value={preAppsApproved}
          headerLabel={t('claimsItems', 'Approved Preauth')}
        />
        <MetricsCard
          label={t('ksh', '')}
          value={preAppsPending}
          headerLabel={t('claimsItems', 'Pending Preauth')}
        />
      </div>
      <ClaimsSummaryChart />

    </>

    
    </div>

  );
};

export default MainMetrics;