import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';

const HIVProgressChart = () => {
  const { t } = useTranslation();

  const generateRandomData = (numRecords: number) => {
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

  const data = useMemo(() => generateRandomData(40), []); // Example: generate data for 10 weeks

  return <BaseProgressTrackingChart data={data} />;
};

export default HIVProgressChart;
