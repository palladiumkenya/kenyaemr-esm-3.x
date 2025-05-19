import { ScaleTypes, StackedBarChart, StackedBarChartOptions } from '@carbon/charts-react';
import { Layer } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './charts.scss';
import { useChartDomain } from '../../hooks/useSurveillanceData';

type Props = {
  data: Array<{ group?: string; day: string; value: number }>;
  height?: string;
  stackTitle?: string;
  leftAxiTtitle?: string;
};

const BaseProgressTrackingChart: React.FC<Props> = ({ data, stackTitle, leftAxiTtitle, height = '300px' }) => {
  const { t } = useTranslation();

  const [minValue, maxValue] = useChartDomain(data);

  const options: StackedBarChartOptions = {
    title: stackTitle,
    legend: {
      enabled: true,
    },
    axes: {
      bottom: {
        title: t('day', 'Day'),
        mapsTo: 'day',
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        title: leftAxiTtitle,
        mapsTo: 'value',
        scaleType: ScaleTypes.LINEAR,
        domain: [0, 100],
      },
    },
    color: {
      scale: {
        Completed: '#008000',
        Pending: '#FF0000',
      },
    },
    height,
    data: {
      groupMapsTo: 'group',
    },
  };

  return (
    <Layer className={styles.chartContainer}>
      <StackedBarChart options={options} data={data} />
    </Layer>
  );
};

export default BaseProgressTrackingChart;
