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
type HEIFinalOutcomesChartProps = {
  startDate?: Date;
  endDate?: Date;
};

const HEIFinalOutcomesChart: React.FC<HEIFinalOutcomesChartProps> = ({ startDate, endDate }) => {
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

  const cumulativeHeiFinalOutcomesData = {
    data: [
      {
        group: 'Completed',
        value: getCompletedPercentage(
          surveillanceSummary?.getHei24MonthsWithoutDocumentedOutcome,
          surveillanceSummary?.getHei24MonthsOld,
        ),
      },
      {
        group: 'Pending',
        value: getPendingPercentage(
          surveillanceSummary?.getHei24MonthsWithoutDocumentedOutcome,
          surveillanceSummary?.getHei24MonthsOld,
        ),
      },
    ],
  };

  const thirtyDaysrunningData = getThirtydaysRunninPercentage(
    surveillanceSummary?.getMonthlyHei24MonthsOld.data,
    surveillanceSummary?.getMonthlyHei24MonthsWithoutDocumentedOutcome.data,
  );

  const lineGraphData = getThirtydaysRunninPendingPercentage(
    surveillanceSummary?.getMonthlyHei24MonthsOld.data,
    surveillanceSummary?.getMonthlyHei24MonthsWithoutDocumentedOutcome.data,
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
            title={t('heiFinalOutcomes', 'Undocumented final outcome')}
            yAxisTitle={t('percentageHEIOutcome', '% undocumented final outcome')}
          />
        ) : (
          <EmptyState subTitle={t('noheiFinalOutcomes', 'No undocumented final outcome data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {thirtyDaysrunningData.length > 0 ? (
          <BaseProgressTrackingChart
            data={thirtyDaysrunningData}
            stackTitle={t('progressInAddressingHEIFinalOutcome', 'Progress in addressing HEI final Outcome')}
            leftAxiTtitle={t('percentageHEIFinalOutcome', '% HEI final outcome')}
          />
        ) : (
          <EmptyState subTitle={t('noHEIFinalOutcome', 'No HEI final outcome data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {surveillanceSummary?.getHei24MonthsOld > 0 ? (
          <div className={styles.cumulativeChart}>
            <BaseCumulativeProgressTrackingChart
              data={cumulativeHeiFinalOutcomesData}
              title={t('cumulativeProgressHeiFinalOutcomes', 'Cumulative progress in addressing HEI final outcome')}
            />
          </div>
        ) : (
          <EmptyState subTitle={t('noheiFinalOutcomes', 'No undocumented final outcome data to display')} />
        )}
      </div>
    </>
  );
};

export default HEIFinalOutcomesChart;
