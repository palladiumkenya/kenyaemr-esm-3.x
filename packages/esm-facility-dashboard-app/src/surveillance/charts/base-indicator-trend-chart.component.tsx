import { LineChart, LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { Layer } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './charts.scss';

type Props = {
  data: Array<{
    week: string;
    abnomallPercentage: number;
  }>;
  title: string;
  yAxisTitle: string;
};
const BaseIndicatorTrendChart: React.FC<Props> = ({ data, title, yAxisTitle }) => {
  const { t } = useTranslation();
  const options: LineChartOptions = {
    title: title,
    legend: {
      enabled: false,
    },
    axes: {
      left: {
        title: yAxisTitle,
        percentage: true,
        scaleType: ScaleTypes.LINEAR,
        includeZero: true,
        mapsTo: 'abnomallPercentage',
      },
      bottom: {
        title: t('durationInWeeks', 'Duration in weeks'),
        scaleType: ScaleTypes.LABELS,
        mapsTo: 'week',
      },
    },
    height: '400px',
  };

  return (
    <Layer className={styles.chartContainer}>
      <LineChart data={data} options={options}></LineChart>
    </Layer>
  );
};

export default BaseIndicatorTrendChart;
