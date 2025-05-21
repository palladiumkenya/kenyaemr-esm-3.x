import { LineChart, LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { Layer } from '@carbon/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './charts.scss';
import { useChartDomain } from '../../hooks/useSurveillanceData';

type Props = {
  data: Array<{
    day: string;
    value: number;
  }>;
  title: string;
  yAxisTitle: string;
  height?: string;
};
const BaseIndicatorTrendChart: React.FC<Props> = ({ data, title, yAxisTitle, height = '300px' }) => {
  const { t } = useTranslation();
  const [minValue, maxValue] = useChartDomain(data);
  const options: LineChartOptions = {
    title: title,
    legend: {
      enabled: false,
    },
    axes: {
      left: {
        title: yAxisTitle,
        scaleType: ScaleTypes.LINEAR,
        domain: [0, 100],
        includeZero: true,
        mapsTo: 'value',
      },
      bottom: {
        title: t('day', 'Day'),
        scaleType: ScaleTypes.LABELS,
        mapsTo: 'day',
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
      <LineChart data={data} options={options}></LineChart>
    </Layer>
  );
};

export default BaseIndicatorTrendChart;
