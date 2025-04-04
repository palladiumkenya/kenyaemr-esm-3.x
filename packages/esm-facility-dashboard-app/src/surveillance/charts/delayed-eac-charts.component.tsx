import '@carbon/charts/styles.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import styles from './charts.scss';
import EmptyState from '../empty-state/empty-state-log.components';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
import { InlineLoading } from '@carbon/react';
type DelayedEACChartsProps = {
  startDate?: Date;
  endDate?: Date;
};

const DelayedEACCharts: React.FC<DelayedEACChartsProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary } = useFacilityDashboardSurveillance(startDate, endDate);

  const delayedEACValue = useSurveillanceData(surveillanceSummary, 'getMonthlyVirallyUnsuppressedWithoutEAC');
  return (
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
  );
};

export default DelayedEACCharts;
