import '@carbon/charts/styles.css';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';
import { getNumberOfDays, sevenDaysRunningDates } from '../../constants';
import styles from './charts.scss';

type PBFWNotInPrepProps = {
  startDate?: Date;
  endDate?: Date;
};
const PBFWNotInPrep: React.FC<PBFWNotInPrepProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const generateRandomData = (numRecords: number) => {
    return Array.from({ length: numRecords }, (_, i) => ({
      day: sevenDaysRunningDates(i, endDate),
      value: Math.floor(Math.random() * 50),
    }));
  };

  const numberSequence = useMemo(() => Math.max(1, getNumberOfDays(startDate, endDate)), [startDate, endDate]);

  const generateRandomDataForProgress = (numRecords: number) => {
    const data = [];
    for (let i = 1; i <= numRecords; i++) {
      data.push({
        group: 'Declined',
        key: sevenDaysRunningDates(i, endDate),
        value: Math.floor(Math.random() * 50),
      });
      data.push({
        group: 'StartedPrEP',
        key: sevenDaysRunningDates(i, endDate),
        value: Math.floor(Math.random() * 50),
      });
    }
    return data;
  };

  const data = useMemo(() => generateRandomDataForProgress(numberSequence), [numberSequence, startDate, endDate]);
  const values = useMemo(() => generateRandomData(numberSequence), [numberSequence, startDate, endDate]);
  return (
    <>
      <BaseIndicatorTrendChart
        data={values}
        title={t('prepNotlinked', 'High risk +ve PBFW not on PrEP')}
        yAxisTitle={t('percentageHightRiskPBFW', '% High risk PBFW Not in PrEP')}
      />
      <BaseProgressTrackingChart data={data} />
    </>
  );
};

export default PBFWNotInPrep;
