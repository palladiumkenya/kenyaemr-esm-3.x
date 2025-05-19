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
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';
type DelayedEACChartsProps = {
  startDate?: Date;
  endDate?: Date;
};

const DelayedEACCharts: React.FC<DelayedEACChartsProps> = ({ startDate, endDate }) => {
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

  const thirtyDaysrunningData = getThirtydaysRunninPercentage(
    surveillanceSummary?.getMonthlyVirallyUnsuppressed.data,
    surveillanceSummary?.getMonthlyVirallyUnsuppressedWithoutEAC.data,
  );

  const lineGraphData = getThirtydaysRunninPendingPercentage(
    surveillanceSummary?.getMonthlyVirallyUnsuppressed.data,
    surveillanceSummary?.getMonthlyVirallyUnsuppressedWithoutEAC.data,
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
            title={t('delayedEAC', 'Delayed enhanced adherence counselling')}
            yAxisTitle={t('numberDelayedEAC', 'Number of Delayed EAC')}
          />
        ) : (
          <EmptyState subTitle={t('noDelayedEAC', 'No Delayed EAC data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {thirtyDaysrunningData.length > 0 ? (
          <BaseProgressTrackingChart
            data={thirtyDaysrunningData}
            stackTitle={t('progressInAdressingDelayedEAC', 'Progress in adressing delayed EAC')}
            leftAxiTtitle={t('percentageDelayedEAC', '% Delayed EAC')}
          />
        ) : (
          <EmptyState subTitle={t('noPendingPCRDNAResults', 'No pending PCR DNA results data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {surveillanceSummary?.getVirallyUnsuppressed > 0 ? (
          <div className={styles.cummulativeChart}>
            <BaseCummulativeProgressTrackingChart
              data={cummulativedelayedEACValueData}
              title={t('cummulativeProgressDelayedEAC', 'Cumilative Progress in adressing delayed EAC')}
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
