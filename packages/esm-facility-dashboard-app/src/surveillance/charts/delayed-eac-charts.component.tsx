import '@carbon/charts/styles.css';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';

const DelayedEACCharts = () => {
  const { t } = useTranslation();
  const generateRandomData = (numRecords: number) => {
    return Array.from({ length: numRecords }, (_, i) => ({
      week: `Week ${i + 1}`,
      abnomallPercentage: Math.floor(Math.random() * 50),
    }));
  };

  const generateRandomDataProgress = (numRecords: number) => {
    const data = [];
    for (let i = 1; i <= numRecords; i++) {
      data.push({
        group: 'Pending',
        key: `Week ${i}`,
        value: Math.floor(Math.random() * 50),
      });
      data.push({
        group: 'Completed',
        key: `Week ${i}`,
        value: Math.floor(Math.random() * 50),
      });
    }
    return data;
  };

  const data = useMemo(() => generateRandomDataProgress(40), []);

  const values = useMemo(() => generateRandomData(40), []);
  return (
    <>
      <BaseIndicatorTrendChart
        data={values}
        title={t('delayedEAC', 'Delayed EAC')}
        yAxisTitle={t('percentageDelatedEAC', '% Delayed EAC')}
      />
      <BaseProgressTrackingChart data={data} />;
    </>
  );
};

export default DelayedEACCharts;
