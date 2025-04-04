import '@carbon/charts/styles.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import styles from './charts.scss';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
import EmptyState from '../empty-state/empty-state-log.components';
import { InlineLoading } from '@carbon/react';
type DNAPCRPendingChartsProps = {
  startDate?: Date;
  endDate?: Date;
};
const DNAPCRPendingCharts: React.FC<DNAPCRPendingChartsProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary } = useFacilityDashboardSurveillance(startDate, endDate);

  const PendingPCRDNAResultsValue = useSurveillanceData(surveillanceSummary, 'getMonthlyHeiDNAPCRPending');
  return (
    <div className={styles.chart}>
      {isLoading ? (
        <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
      ) : PendingPCRDNAResultsValue.length > 0 ? (
        <BaseIndicatorTrendChart
          data={PendingPCRDNAResultsValue}
          title={t('dnapcrPending', 'HEI (6-8 weeks) without DNA-PCR Results')}
          yAxisTitle={t('numberOfPendingPCRDNAResults', 'Number of HEI (6-8 weeks) without DNA-PCR Results')}
        />
      ) : (
        <EmptyState subTitle={t('noPendingPCRDNAResults', 'No PendingPCRDNAResults data to display')} />
      )}
    </div>
  );
};

export default DNAPCRPendingCharts;
