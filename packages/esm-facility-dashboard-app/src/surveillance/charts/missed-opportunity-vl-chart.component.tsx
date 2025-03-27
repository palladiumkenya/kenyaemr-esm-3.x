import '@carbon/charts/styles.css';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';
import { getNumberOfDays, sevenDaysRunningDates } from '../../constants';
import styles from './charts.scss';
type MissedOpportunityChartProps = {
  startDate?: Date;
  endDate?: Date;
};
const MissedOpportunityChart: React.FC<MissedOpportunityChartProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const generateRandomData = (numRecords: number) => {
    return Array.from({ length: numRecords }, (_, i) => ({
      week: sevenDaysRunningDates(i, endDate),
      abnomallPercentage: Math.floor(Math.random() * 50),
    }));
  };

  const numberSequence = useMemo(() => Math.max(1, getNumberOfDays(startDate, endDate)), [startDate, endDate]);

  const generateRandomDataProgress = (numRecords: number) => {
    const data = [];
    for (let i = 1; i <= numRecords; i++) {
      data.push({
        group: 'Pending',
        key: sevenDaysRunningDates(i, endDate),
        value: Math.floor(Math.random() * 50),
      });
      data.push({
        group: 'Completed',
        key: sevenDaysRunningDates(i, endDate),
        value: Math.floor(Math.random() * 50),
      });
    }
    return data;
  };

  const data = useMemo(() => generateRandomDataProgress(numberSequence), [numberSequence, startDate, endDate]);
  const values = useMemo(() => generateRandomData(numberSequence), [numberSequence, startDate, endDate]);
  return (
    <BaseIndicatorTrendChart
      data={values}
      title={t('missedoppotunityVL', 'Missed opportunity in viral load testing')}
      yAxisTitle={t('percentageMissedVL', '% of missed opportunity VL')}
    />
  );
};

export default MissedOpportunityChart;
