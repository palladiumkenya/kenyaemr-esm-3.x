import '@carbon/charts/styles.css';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';
import { DATE_PICKER_FORMAT, formattedDate, getNumberOfDays, sevenDaysRunningDates } from '../../constants';
import styles from './charts.scss';
import BaseArtProgressTrackingChart from './base-art-progress-tracking-chart.component';
import dayjs from 'dayjs';
type HIVPositiveNotLinkedToARTProps = {
  startDate?: Date;
  endDate?: Date;
};
const HIVPositiveNotLinkedToART: React.FC<HIVPositiveNotLinkedToARTProps> = ({ startDate, endDate }) => {
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
      const formattedDate = sevenDaysRunningDates(i, endDate);
      data.push({
        group: 'LinkedElsewere',
        key: formattedDate,
        value: Math.floor(Math.random() * 50),
      });
      data.push({
        group: 'Dead',
        key: formattedDate,
        value: Math.floor(Math.random() * 50),
      });
      data.push({
        group: 'Denial',
        key: formattedDate,
        value: Math.floor(Math.random() * 50),
      });
      data.push({
        group: 'Others',
        key: formattedDate,
        value: Math.floor(Math.random() * 50),
      });
      data.push({
        group: 'NotFound',
        key: formattedDate,
        value: Math.floor(Math.random() * 50),
      });
    }

    return data;
  };

  const data = useMemo(() => generateRandomDataProgress(numberSequence), [numberSequence, startDate, endDate]);
  const values = useMemo(() => generateRandomData(numberSequence), [numberSequence, startDate, endDate]);
  return (
    <>
      <BaseIndicatorTrendChart
        data={values}
        title={t('hivPositiveNotLinkedToART', 'HIV +VE Not linked to ART')}
        yAxisTitle={t('percentageTestedPositiveNotLinked', '% tested positive not linked')}
      />
      <BaseArtProgressTrackingChart data={data} />
    </>
  );
};

export default HIVPositiveNotLinkedToART;
