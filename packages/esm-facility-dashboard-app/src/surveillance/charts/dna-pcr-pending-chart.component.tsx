import '@carbon/charts/styles.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import styles from './charts.scss';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
import EmptyState from '../empty-state/empty-state-log.components';
import { InlineLoading } from '@carbon/react';
import BaseCummulativeProgressTrackingChart from './base-cummulative-progress-tracking-chart.component';
type DNAPCRPendingChartsProps = {
  startDate?: Date;
  endDate?: Date;
};
const DNAPCRPendingCharts: React.FC<DNAPCRPendingChartsProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary, getCompletedPercentage, getPendingPercentage } =
    useFacilityDashboardSurveillance(startDate, endDate);

  const PendingPCRDNAResultsValue = useSurveillanceData(surveillanceSummary, 'getMonthlyHeiDNAPCRPending');

  const cummulativeDnapcrPendingData = {
    data: [
      {
        group: 'Completed',
        value: getCompletedPercentage(
          surveillanceSummary?.getHeiSixToEightWeeksWithoutPCRResults,
          surveillanceSummary.getHeiSixToEightWeeksOld,
        ),
      },
      {
        group: 'Pending',
        value: getPendingPercentage(
          surveillanceSummary?.getHeiSixToEightWeeksWithoutPCRResults,
          surveillanceSummary.getHeiSixToEightWeeksOld,
        ),
      },
    ],
  };
  return (
    <>
      <div className={styles.chart}>
        {isLoading ? (
          <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
        ) : PendingPCRDNAResultsValue.length > 0 ? (
          <BaseIndicatorTrendChart
            data={PendingPCRDNAResultsValue}
            title={t('dnapcrPending', 'HEI (6-8 weeks) without DNA-PCR results')}
            yAxisTitle={t('numberOfPendingPCRDNAResults', 'Number of HEI (6-8 weeks) without DNA-PCR results')}
          />
        ) : (
          <EmptyState subTitle={t('noPendingPCRDNAResults', 'No pending PCR DNA results data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {surveillanceSummary?.getHeiSixToEightWeeksOld > 0 ? (
          <div className={styles.cummulativeChart}>
            <BaseCummulativeProgressTrackingChart
              data={cummulativeDnapcrPendingData}
              title={t(
                'cummulativeProgressDnapcrPending',
                'Cummulative progress of HEI (6-8 weeks) without DNA-PCR results',
              )}
            />
          </div>
        ) : (
          <EmptyState
            subTitle={t('noCummulativeDnapcrPending', 'No cummulative HEI (6-8 weeks) without DNA-PCR data to display')}
          />
        )}
      </div>
    </>
  );
};

export default DNAPCRPendingCharts;
