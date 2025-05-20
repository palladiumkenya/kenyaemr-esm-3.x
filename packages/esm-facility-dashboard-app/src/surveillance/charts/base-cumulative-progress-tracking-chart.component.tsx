import { ScaleTypes, SimpleBarChart, BarChartOptions } from '@carbon/charts-react';
import { Layer } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './charts.scss';
import { LinkageData } from '../../types';

type Props = {
  data: LinkageData;
  height?: string;
  title?: string;
  yAxisTitle?: string;
};

const BaseCumulativeProgressTrackingChart: React.FC<Props> = ({ data, title, yAxisTitle, height = '300px' }) => {
  const { t } = useTranslation();

  const chartData = data?.data || [];

  const options: BarChartOptions = {
    title: title,
    axes: {
      left: {
        title: yAxisTitle,
        scaleType: ScaleTypes.LINEAR,
        domain: [0, 100],
        includeZero: true,
        mapsTo: 'value',
      },
      bottom: {
        mapsTo: 'group',
        scaleType: ScaleTypes.LABELS,
      },
    },
    height: height,
    color: {
      scale: {
        Completed: '#008000',
        Pending: '#FF0000',
      },
    },
  };
  return (
    <Layer className={styles.chartContainer}>
      <SimpleBarChart options={options} data={chartData} />
    </Layer>
  );
};

export default BaseCumulativeProgressTrackingChart;
