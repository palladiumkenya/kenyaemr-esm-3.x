import '@carbon/charts/styles.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import styles from './charts.scss';
import EmptyState from '../empty-state/empty-state-log.components';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
import { InlineLoading } from '@carbon/react';
import BaseCummulativeProgressTrackingChart from './base-cummulative-progress-tracking-chart.component';
type DelayedEACChartsProps = {
  startDate?: Date;
  endDate?: Date;
};

const DelayedEACCharts: React.FC<DelayedEACChartsProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary, getCompletedPercentage, getPendingPercentage } =
    useFacilityDashboardSurveillance(startDate, endDate);

  const delayedEACValue = useSurveillanceData(surveillanceSummary, 'getMonthlyVirallyUnsuppressedWithoutEAC');

  const cummulativedelayedEACValueData = {
    data: [
      {
        group: 'Completed',
        value: getCompletedPercentage(
          surveillanceSummary?.getVirallyUnsuppressedWithoutEAC,
          surveillanceSummary?.getVirallyUnsuppressed,
        ),
      },
      {
        group: 'Pending',
        value: getPendingPercentage(
          surveillanceSummary?.getVirallyUnsuppressedWithoutEAC,
          surveillanceSummary?.getVirallyUnsuppressed,
        ),
      },
    ],
  };
  return (
    <>
      <div className={styles.chart}>
        {isLoading ? (
          <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
        ) : delayedEACValue.length > 0 ? (
          <BaseIndicatorTrendChart
            data={delayedEACValue}
            title={t('delayedEAC', 'Delayed enhanced adherence counselling')}
            yAxisTitle={t('numberDelayedEAC', 'Number of Delayed EAC')}
          />
        ) : (
          <EmptyState subTitle={t('noDelayedEAC', 'No Delayed EAC data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {surveillanceSummary?.getVirallyUnsuppressed > 0 ? (
          <div className={styles.cummulativeChart}>
            <BaseCummulativeProgressTrackingChart
              data={cummulativedelayedEACValueData}
              title={t(
                'cummulativeProgressDelayedEAC',
                'Cummulative progress of delayed enhanced adherence counselling',
              )}
            />
          </div>
        ) : (
          <EmptyState subTitle={t('noDelayedEAC', 'No Delayed EAC data to display')} />
        )}
      </div>
    </>
  );
};

export default DelayedEACCharts;
