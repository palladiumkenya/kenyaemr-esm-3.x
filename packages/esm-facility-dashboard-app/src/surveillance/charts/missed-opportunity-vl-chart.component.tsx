import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import styles from './charts.scss';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
import EmptyState from '../empty-state/empty-state-log.components';
import { InlineLoading } from '@carbon/react';
type MissedOpportunityChartProps = {
  startDate?: Date;
  endDate?: Date;
};
const MissedOpportunityChart: React.FC<MissedOpportunityChartProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary } = useFacilityDashboardSurveillance(startDate, endDate);

  const missedoppotunityVLValue = useSurveillanceData(surveillanceSummary, 'getMonthlyEligibleForVlSampleNotTaken');
  return (
    <div className={styles.chart}>
      {isLoading ? (
        <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
      ) : missedoppotunityVLValue.length > 0 ? (
        <BaseIndicatorTrendChart
          data={missedoppotunityVLValue}
          title={t('missedoppotunityVL', 'Missed opportunity in viral load testing')}
          yAxisTitle={t('numberMissedVL', 'Number of missed opportunity VL')}
        />
      ) : (
        <EmptyState subTitle={t('nomissedoppotunityVL', 'No missed opportunity VL data to display')} />
      )}
    </div>
  );
};

export default MissedOpportunityChart;
