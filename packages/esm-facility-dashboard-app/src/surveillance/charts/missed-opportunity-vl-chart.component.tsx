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
type MissedOpportunityChartProps = {
  startDate?: Date;
  endDate?: Date;
};
const MissedOpportunityChart: React.FC<MissedOpportunityChartProps> = ({ startDate, endDate }) => {
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

  const cumulativeMissedoppotunityVLData = {
    data: [
      {
        group: 'Completed',
        value: getCompletedPercentage(
          surveillanceSummary?.getEligibleForVlSampleNotTaken,
          surveillanceSummary?.getEligibleForVl,
        ),
      },
      {
        group: 'Pending',
        value: getPendingPercentage(
          surveillanceSummary?.getEligibleForVlSampleNotTaken,
          surveillanceSummary?.getEligibleForVl,
        ),
      },
    ],
  };

  const thirtyDaysrunningData = getThirtydaysRunninPercentage(
    surveillanceSummary?.getMonthlyEligibleForVl.data,
    surveillanceSummary?.getMonthlyEligibleForVlSampleNotTaken.data,
  );

  const lineGraphData = getThirtydaysRunninPendingPercentage(
    surveillanceSummary?.getMonthlyEligibleForVl.data,
    surveillanceSummary?.getMonthlyEligibleForVlSampleNotTaken.data,
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
            title={t('missedoppotunityVL', 'Missed opportunity in viral load testing')}
            yAxisTitle={t('percentageMissedVL', '% of missed opportunity VL')}
          />
        ) : (
          <EmptyState subTitle={t('nomissedoppotunityVL', 'No missed opportunity VL data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {thirtyDaysrunningData.length > 0 ? (
          <BaseProgressTrackingChart
            data={thirtyDaysrunningData}
            stackTitle={t('progressInAddressingDelayedVL', 'Progress in addressing delayed VL testing')}
            leftAxiTtitle={t('percentageEligibleForVL', '% eligible for VL')}
          />
        ) : (
          <EmptyState subTitle={t('noEligibleForVL', 'No eligible for VL data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {surveillanceSummary?.getEligibleForVl > 0 ? (
          <div className={styles.cumulativeChart}>
            <BaseCumulativeProgressTrackingChart
              data={cumulativeMissedoppotunityVLData}
              title={t('cumulativeProgressMissedoppotunityVL', 'Cumilative Progress in addressing delayed VL Testing')}
            />
          </div>
        ) : (
          <EmptyState
            subTitle={t('noCumulativeMissedoppotunityVL', 'No cumulative missed opportunity VL data to display')}
          />
        )}
      </div>
    </>
  );
};

export default MissedOpportunityChart;
