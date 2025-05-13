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
type HEIFinalOutcomesChartProps = {
  startDate?: Date;
  endDate?: Date;
};

const HEIFinalOutcomesChart: React.FC<HEIFinalOutcomesChartProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary, getCompletedPercentage, getPendingPercentage } =
    useFacilityDashboardSurveillance(startDate, endDate);

  const heiFinalOutcomesValue = useSurveillanceData(
    surveillanceSummary,
    'getMonthlyHei24MonthsWithoutDocumentedOutcome',
  );

  const cummulativeHeiFinalOutcomesData = {
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
  return (
    <>
      <div className={styles.chart}>
        {isLoading ? (
          <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
        ) : heiFinalOutcomesValue.length > 0 ? (
          <BaseIndicatorTrendChart
            data={heiFinalOutcomesValue}
            title={t('heiFinalOutcomes', 'Undocumented final outcome')}
            yAxisTitle={t('numberHEIOutcome', 'Number of undocumented final outcome')}
          />
        ) : (
          <EmptyState subTitle={t('noheiFinalOutcomes', 'No undocumented final outcome data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {surveillanceSummary?.getHei24MonthsOld > 0 ? (
          <div className={styles.cummulativeChart}>
            <BaseCummulativeProgressTrackingChart
              data={cummulativeHeiFinalOutcomesData}
              title={t('cummulativeProgressHeiFinalOutcomes', 'Cummulative progress of undocumented final outcome')}
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
