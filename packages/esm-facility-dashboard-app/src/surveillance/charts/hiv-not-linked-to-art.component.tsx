import '@carbon/charts/styles.css';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';
import { sevenDaysRunningDates } from '../../constants';
import styles from './charts.scss';
const HIVPositiveNotLinkedToART = () => {
  const { t } = useTranslation();

  const generateRandomData = (numRecords: number) => {
    return Array.from({ length: numRecords }, (_, i) => ({
      week: sevenDaysRunningDates(i),
      abnomallPercentage: Math.floor(Math.random() * 50),
    }));
  };

  const generateRandomDataProgress = (numRecords: number) => {
    const data = [];
    for (let i = 1; i <= numRecords; i++) {
      const formattedDate = sevenDaysRunningDates(i);
      data.push({
        group: 'Pending',
        key: formattedDate,
        value: Math.floor(Math.random() * 50),
      });
      data.push({
        group: 'Completed',
        key: formattedDate,
        value: Math.floor(Math.random() * 50),
      });
    }
    return data;
  };

  const data = useMemo(() => generateRandomDataProgress(7), []);

  const values = useMemo(() => generateRandomData(7), []);
  return (
    <>
      <div className={styles.chartGroupContainer}>
        <div className={styles.tendChart}>
          <BaseIndicatorTrendChart
            data={values}
            title={t('hivPositiveNotLinkedToART', 'HIV +VE Not linked to ART')}
            yAxisTitle={t('percentageTestedPositiveNotLinked', '% tested positive not linked')}
          />
        </div>
        <div className={styles.trackingChart}>
          <BaseProgressTrackingChart data={data} />
        </div>
      </div>
    </>
  );
};

export default HIVPositiveNotLinkedToART;
