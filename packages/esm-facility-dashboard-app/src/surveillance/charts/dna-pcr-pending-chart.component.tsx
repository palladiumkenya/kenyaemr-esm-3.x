import '@carbon/charts/styles.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import styles from './charts.scss';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
import EmptyState from '../empty-state/empty-state-log.components';
import { InlineLoading } from '@carbon/react';
import BaseCumulativeProgressTrackingChart from './base-cumulative-progress-tracking-chart.component';
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';
type DNAPCRPendingChartsProps = {
  startDate?: Date;
  endDate?: Date;
};
const DNAPCRPendingCharts: React.FC<DNAPCRPendingChartsProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const {
    error,
    isLoading,
    surveillanceSummary,
    getCompletedPercentage,
    getPendingPercentage,
    getThirtydaysRunninPercentage,
    getThirtydaysRunninPendingPercentage,
  } = useFacilityDashboardSurveillance(startDate, endDate);

  const cumulativeDnapcrPendingData = {
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

  const thirtyDaysrunningData = getThirtydaysRunninPercentage(
    surveillanceSummary?.getMonthlyHeiSixToEightWeeksOld.data,
    surveillanceSummary?.getMonthlyHeiDNAPCRPending.data,
  );

  const lineGraphData = getThirtydaysRunninPendingPercentage(
    surveillanceSummary?.getMonthlyHeiSixToEightWeeksOld.data,
    surveillanceSummary?.getMonthlyHeiDNAPCRPending.data,
  );

  if (error) {
    return <EmptyState subTitle={t('errorLoadingData', 'Error loading data')} />;
  }

  return (
    <>
      <div className={styles.chart}>
        {isLoading ? (
          <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
        ) : lineGraphData.length > 0 ? (
          <BaseIndicatorTrendChart
            data={lineGraphData}
            title={t('dnapcrPending', 'HEI (8 weeks) without DNA-PCR results')}
            yAxisTitle={t('percentageOfPendingPCRDNAResults', '% HEI (8 weeks) without DNA-PCR results')}
          />
        ) : (
          <EmptyState subTitle={t('noPendingPCRDNAResults', 'No pending PCR DNA results data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {thirtyDaysrunningData.length > 0 ? (
          <BaseProgressTrackingChart
            data={thirtyDaysrunningData}
            stackTitle={t('progressInAddressingHEIPCRResults ', 'Progress in addressing  HEI PCR results')}
            leftAxiTtitle={t('percentageHEIPCRResults', '% HEI (8 weeks) PCR result')}
          />
        ) : (
          <EmptyState subTitle={t('noPendingPCRDNAResults', 'No pending PCR DNA results data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {surveillanceSummary?.getHeiSixToEightWeeksOld > 0 ? (
          <div className={styles.cumulativeChart}>
            <BaseCumulativeProgressTrackingChart
              data={cumulativeDnapcrPendingData}
              title={t('cumulativeProgressDnapcrPending', 'Cumulative Progress in addressing  HEI PCR results')}
            />
          </div>
        ) : (
          <EmptyState
            subTitle={t('noCumulativeDnapcrPending', 'No cumulative HEI (8 weeks) without DNA-PCR data to display')}
          />
        )}
      </div>
    </>
  );
};

export default DNAPCRPendingCharts;
